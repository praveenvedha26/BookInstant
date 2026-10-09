package com.bookinstant.service;

import com.bookinstant.dto.AdminHoldDto;
import com.bookinstant.dto.SeatLockRequest;
import com.bookinstant.dto.SeatLockResponse;
import com.bookinstant.dto.SeatStatusDto;
import com.bookinstant.entity.BookingStatus;
import com.bookinstant.entity.Seat;
import com.bookinstant.entity.Showtime;
import com.bookinstant.repository.BookingRepository;
import com.bookinstant.repository.SeatRepository;
import com.bookinstant.repository.ShowtimeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RBucket;
import org.redisson.api.RKeys;
import org.redisson.api.RedissonClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class SeatLockService {

    private final RedissonClient redissonClient;
    private final SeatRepository seatRepository;
    private final ShowtimeRepository showtimeRepository;
    private final BookingRepository bookingRepository;
    private final AuditLogService auditLogService;

    @Autowired(required = false)
    private StringRedisTemplate redisTemplate;

    // Constants
    public static final long HOLD_TTL_MINUTES = 10;
    public static final long HOLD_TTL_SECONDS = HOLD_TTL_MINUTES * 60; // 600s
    private static final String SEAT_HOLD_PREFIX = "seat:hold:";

    // In-memory fallback structures for zero-setup standalone dev mode
    private final Map<String, String> localHoldMap = new ConcurrentHashMap<>();
    private final Map<String, Long> localExpiryMap = new ConcurrentHashMap<>();

    /**
     * Strict Redis Key Hold Pattern with automatic 10-Minute TTL (600s).
     * Key Format: seat:hold:{showtimeId}:{seatId}
     * Key Value: {userId} (e.g., User_1)
     * Atomic SETNX execution enforces zero race conditions and blocks concurrent locking.
     */
    private Long parseNumericShowtimeId(String showtimeId) {
        if (showtimeId == null || showtimeId.isBlank()) return 1L;
        try {
            return Long.parseLong(showtimeId);
        } catch (NumberFormatException e) {
            java.util.regex.Matcher m = java.util.regex.Pattern.compile("(\\d+)").matcher(showtimeId);
            if (m.find()) {
                try {
                    return Long.parseLong(m.group(1));
                } catch (Exception ignored) {}
            }
        }
        return 1L;
    }

    private Long parseNumericSeatId(String seatId) {
        if (seatId == null || seatId.isBlank()) return null;
        try {
            return Long.parseLong(seatId);
        } catch (NumberFormatException e) {
            java.util.regex.Matcher m = java.util.regex.Pattern.compile("(\\d+)").matcher(seatId);
            if (m.find()) {
                try {
                    return Long.parseLong(m.group(1));
                } catch (Exception ignored) {}
            }
        }
        return null;
    }

    private boolean isSameUser(String u1, String u2) {
        if (u1 == null || u2 == null) return false;
        if (u1.equals(u2)) return true;
        String clean1 = u1.replaceAll("(?i)^user_?", "").trim();
        String clean2 = u2.replaceAll("(?i)^user_?", "").trim();
        return clean1.equals(clean2);
    }

    public SeatLockResponse lockSeats(SeatLockRequest request) {
        String showtimeId = request.getShowtimeIdStr();
        List<String> seatIds = request.getSeatIdStrs();
        String userVal = request.getUserIdStr();

        if (seatIds == null || seatIds.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No seats specified for locking");
        }

        Long numericShowtimeId = parseNumericShowtimeId(showtimeId);
        if (numericShowtimeId != null) {
            List<Long> alreadyBookedIds = bookingRepository.findBookedSeatIdsByShowtimeIdAndStatus(numericShowtimeId, BookingStatus.CONFIRMED);
            for (String seatId : seatIds) {
                Long sid = parseNumericSeatId(seatId);
                if (sid != null && alreadyBookedIds.contains(sid)) {
                    auditLogService.record(userVal, seatId, "LOCK_ATTEMPT", 409, "Seat is permanently BOOKED in PostgreSQL");
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "One or more selected seats are no longer available for this showtime.");
                }
            }
        }

        // 1. Atomic Multi-Key Validation: Loop through all requested seatIds for that specific showtimeId
        // Check if ANY key seat:hold:{showtimeId}:{seatId} already exists in Redis
        for (String seatId : seatIds) {
            String key = SEAT_HOLD_PREFIX + showtimeId + ":" + seatId;
            String keyNum = SEAT_HOLD_PREFIX + numericShowtimeId + ":" + seatId;
            String currentHolder = getKeyValue(key);
            if (currentHolder == null) {
                currentHolder = getKeyValue(keyNum);
            }
            if (currentHolder != null && !isSameUser(currentHolder, userVal)) {
                auditLogService.record(userVal, seatId, "LOCK_CONFLICT", 409, 
                        "Seat " + seatId + " already held in Redis by user " + currentHolder + " for showtime " + showtimeId);
                throw new ResponseStatusException(HttpStatus.CONFLICT, 
                        "One or more selected seats are no longer available for this showtime.");
            }
        }

        // 2. If ALL requested seats are free, execute atomic setIfAbsent (SETNX) for each seat with a 10-minute TTL (600 seconds)
        List<String> lockedKeysInThisTx = new ArrayList<>();

        try {
            for (String seatId : seatIds) {
                String key = SEAT_HOLD_PREFIX + showtimeId + ":" + seatId;
                boolean acquired = tryAcquireKey(key, userVal, HOLD_TTL_MINUTES);

                if (!acquired) {
                    String currentHolder = getKeyValue(key);
                    if (currentHolder != null && isSameUser(currentHolder, userVal)) {
                        refreshKeyTtl(key, userVal, HOLD_TTL_MINUTES);
                        lockedKeysInThisTx.add(key);
                    } else {
                        auditLogService.record(userVal, seatId, "LOCK_CONFLICT", 409, 
                                "Seat " + seatId + " already held in Redis by user " + currentHolder + " for showtime " + showtimeId);
                        throw new ResponseStatusException(HttpStatus.CONFLICT, 
                                "One or more selected seats are no longer available for this showtime.");
                    }
                } else {
                    lockedKeysInThisTx.add(key);
                }
            }

            LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(HOLD_TTL_MINUTES);
            auditLogService.record(userVal, seatIds.toString(), "LOCK_SUCCESS", 200, 
                    "Atomically locked " + seatIds.size() + " seat(s) in Redis for showtime " + showtimeId + " (10-min TTL)");

            return SeatLockResponse.builder()
                    .showtimeId(request.getShowtimeId())
                    .seatIds(seatIds)
                    .userId(request.getUserId())
                    .ttlSeconds(HOLD_TTL_SECONDS)
                    .expiresAt(expiresAt)
                    .message("Seats successfully held for 10 minutes. Complete mock payment before expiry.")
                    .build();

        } catch (ResponseStatusException e) {
            // Abort the entire transaction and rollback any partial holds
            for (String rollbackKey : lockedKeysInThisTx) {
                deleteKeyIfOwned(rollbackKey, userVal);
            }
            throw e;
        }
    }

    /**
     * Endpoint: GET /api/v1/seats/showtime/{showtimeId}
     * Returns seat matrix where each seat includes its status and owner:
     * - Status AVAILABLE: Unlocked
     * - Status HELD: Locked in Redis. If heldBy == currentUserId: Green. If heldBy != currentUserId: Yellow & Disabled.
     * - Status BOOKED: Sold in DB: Red & Disabled
     */
    public List<SeatStatusDto> getSeatsStatus(Object rawShowtimeId, Object rawCurrentUserId) {
        String showtimeId = String.valueOf(rawShowtimeId);
        Long numericShowtimeId = parseNumericShowtimeId(showtimeId);

        List<Seat> seats = new ArrayList<>();
        List<Long> bookedSeatIds = new ArrayList<>();
        BigDecimal defaultPrice = BigDecimal.valueOf(350);
        final BigDecimal[] showtimePrice = new BigDecimal[]{ defaultPrice };

        if (numericShowtimeId != null) {
            final Long lookupId = numericShowtimeId;
            showtimeRepository.findById(lookupId).ifPresent(st -> {
                if (st.getPrice() != null) {
                    showtimePrice[0] = st.getPrice();
                }
                Long screenId = st.getScreen().getId();
                seats.addAll(seatRepository.findByScreenIdOrderByRowLabelAscSeatNumberAsc(screenId));
                bookedSeatIds.addAll(bookingRepository.findBookedSeatIdsByShowtimeIdAndStatus(lookupId, BookingStatus.CONFIRMED));
            });
        }

        if (seats.isEmpty()) {
            seats.addAll(seatRepository.findAll());
            bookedSeatIds.addAll(bookingRepository.findBookedSeatIdsByShowtimeIdAndStatus(1L, BookingStatus.CONFIRMED));
        }

        List<SeatStatusDto> result = new ArrayList<>();

        for (Seat seat : seats) {
            String key = SEAT_HOLD_PREFIX + showtimeId + ":" + seat.getId();
            String keyNum = SEAT_HOLD_PREFIX + numericShowtimeId + ":" + seat.getId();
            String heldByUserIdStr = getKeyValue(key);
            long remainingSeconds = getKeyTtlSeconds(key);
            if (heldByUserIdStr == null || remainingSeconds <= 0) {
                heldByUserIdStr = getKeyValue(keyNum);
                remainingSeconds = getKeyTtlSeconds(keyNum);
            }

            String status = "AVAILABLE";
            Long heldByLong = null;

            if (bookedSeatIds.contains(seat.getId())) {
                status = "BOOKED"; // Red & Disabled
            } else if (heldByUserIdStr != null && remainingSeconds > 0) {
                status = "HELD"; // In Redis
                try {
                    heldByLong = Long.parseLong(heldByUserIdStr.replaceAll("(?i)^user_?", "").trim());
                } catch (Exception e) {
                    heldByLong = null;
                }
            }

            String seatLabel = seat.getRowLabel() + seat.getSeatNumber();

            result.add(SeatStatusDto.builder()
                    .id(seat.getId())
                    .rowLabel(seat.getRowLabel())
                    .seatNumber(seat.getSeatNumber())
                    .seatLabel(seatLabel)
                    .seatType(seat.getSeatType())
                    .price(showtimePrice[0])
                    .status(status)
                    .heldBy(heldByLong)
                    .lockedByUserId(heldByLong)
                    .heldByName(heldByUserIdStr != null ? "User " + heldByUserIdStr : null)
                    .remainingHoldSeconds(Math.max(0, remainingSeconds))
                    .build());
        }

        return result;
    }

    /**
     * Release hold keys from Redis (called upon cancellation or after payment confirmation)
     */
    public void releaseHolds(Object rawShowtimeId, List<?> seatIds, Object rawUserId) {
        String showtimeId = String.valueOf(rawShowtimeId);
        Long numericShowtimeId = parseNumericShowtimeId(showtimeId);
        String userVal = rawUserId != null ? String.valueOf(rawUserId) : "";

        for (Object seatIdObj : seatIds) {
            String seatId = String.valueOf(seatIdObj);
            deleteKeyIfOwned(SEAT_HOLD_PREFIX + showtimeId + ":" + seatId, userVal);
            deleteKeyIfOwned(SEAT_HOLD_PREFIX + numericShowtimeId + ":" + seatId, userVal);
            deleteKeyIfOwned(showtimeId + ":" + seatId, userVal);
            deleteKeyIfOwned(numericShowtimeId + ":" + seatId, userVal);
        }
        auditLogService.record(userVal, seatIds.toString(), "SEATS_RELEASED", 200, "Released Redis seat hold keys");
    }

    /**
     * Inspect active Redis holds for Admin Concurrency Dashboard
     */
    public List<AdminHoldDto> getAllActiveHolds() {
        List<AdminHoldDto> holds = new ArrayList<>();

        try {
            RKeys keys = redissonClient.getKeys();
            Iterable<String> holdKeys = keys.getKeysByPattern(SEAT_HOLD_PREFIX + "*");
            for (String key : holdKeys) {
                String val = getKeyValue(key);
                long ttl = getKeyTtlSeconds(key);
                if (val != null && ttl > 0) {
                    parseAndAddHoldDto(key, val, ttl, holds);
                }
            }
        } catch (Exception ex) {
            // local fallback
            long now = System.currentTimeMillis();
            for (Map.Entry<String, Long> entry : localExpiryMap.entrySet()) {
                if (entry.getValue() > now) {
                    String key = entry.getKey();
                    String val = localHoldMap.get(key);
                    long ttl = (entry.getValue() - now) / 1000;
                    parseAndAddHoldDto(key, val, ttl, holds);
                }
            }
        }

        holds.sort((a, b) -> Long.compare(b.getTtlSeconds(), a.getTtlSeconds()));
        return holds;
    }

    // --- Atomic Helper Methods ---

    private boolean tryAcquireKey(String key, String userId, long ttlMinutes) {
        // 1. Try StringRedisTemplate if available
        if (redisTemplate != null) {
            try {
                Boolean setSuccess = redisTemplate.opsForValue().setIfAbsent(key, userId, ttlMinutes, TimeUnit.MINUTES);
                return Boolean.TRUE.equals(setSuccess);
            } catch (Exception ignored) {}
        }

        // 2. Try Redisson Client Bucket
        try {
            RBucket<String> bucket = redissonClient.getBucket(key);
            return bucket.setIfAbsent(userId, Duration.ofMinutes(ttlMinutes));
        } catch (Exception ex) {
            // 3. Fallback to local in-memory atomic map
            long now = System.currentTimeMillis();
            Long existingExp = localExpiryMap.get(key);
            if (existingExp != null && existingExp > now) {
                // Key currently held
                return false;
            }
            localHoldMap.put(key, userId);
            localExpiryMap.put(key, now + (ttlMinutes * 60 * 1000));
            return true;
        }
    }

    private String getKeyValue(String key) {
        if (redisTemplate != null) {
            try {
                return redisTemplate.opsForValue().get(key);
            } catch (Exception ignored) {}
        }
        try {
            RBucket<String> bucket = redissonClient.getBucket(key);
            if (bucket.isExists()) return bucket.get();
        } catch (Exception ignored) {}

        // Fallback
        Long exp = localExpiryMap.get(key);
        if (exp != null && exp > System.currentTimeMillis()) {
            return localHoldMap.get(key);
        }
        localHoldMap.remove(key);
        localExpiryMap.remove(key);
        return null;
    }

    private long getKeyTtlSeconds(String key) {
        if (redisTemplate != null) {
            try {
                Long exp = redisTemplate.getExpire(key, TimeUnit.SECONDS);
                if (exp != null && exp > 0) return exp;
            } catch (Exception ignored) {}
        }
        try {
            RBucket<String> bucket = redissonClient.getBucket(key);
            if (bucket.isExists()) {
                return Math.max(0, bucket.remainTimeToLive() / 1000);
            }
        } catch (Exception ignored) {}

        Long exp = localExpiryMap.get(key);
        if (exp != null && exp > System.currentTimeMillis()) {
            return (exp - System.currentTimeMillis()) / 1000;
        }
        return 0;
    }

    private void refreshKeyTtl(String key, String userId, long ttlMinutes) {
        if (redisTemplate != null) {
            try {
                redisTemplate.opsForValue().set(key, userId, ttlMinutes, TimeUnit.MINUTES);
                return;
            } catch (Exception ignored) {}
        }
        try {
            RBucket<String> bucket = redissonClient.getBucket(key);
            bucket.set(userId, Duration.ofMinutes(ttlMinutes));
        } catch (Exception ignored) {
            localHoldMap.put(key, userId);
            localExpiryMap.put(key, System.currentTimeMillis() + (ttlMinutes * 60 * 1000));
        }
    }

    private void deleteKeyIfOwned(String key, String userId) {
        String owner = getKeyValue(key);
        if (owner != null && (userId == null || userId.isBlank() || isSameUser(owner, userId))) {
            if (redisTemplate != null) {
                try {
                    redisTemplate.delete(key);
                } catch (Exception ignored) {}
            }
            try {
                redissonClient.getBucket(key).delete();
            } catch (Exception ignored) {}
            localHoldMap.remove(key);
            localExpiryMap.remove(key);
        }
    }

    private void parseAndAddHoldDto(String key, String userId, long ttlSeconds, List<AdminHoldDto> list) {
        try {
            String[] parts = key.split(":");
            if (parts.length >= 4) {
                Long showtimeId = Long.parseLong(parts[2]);
                Long seatId = Long.parseLong(parts[3]);
                String seatLabel = getSeatLabel(seatId);

                long mins = ttlSeconds / 60;
                long secs = ttlSeconds % 60;
                String formatted = String.format("%02d:%02d", mins, secs);

                Long uId = null;
                try { uId = Long.parseLong(userId); } catch (Exception ignored) {}

                list.add(AdminHoldDto.builder()
                        .redisKey(key)
                        .showtimeId(showtimeId)
                        .seatId(seatId)
                        .seatLabel(seatLabel)
                        .userId(uId)
                        .ttlSeconds(ttlSeconds)
                        .formattedTtl(formatted)
                        .build());
            }
        } catch (Exception e) {
            log.warn("Could not parse hold key {}: {}", key, e.getMessage());
        }
    }

    private String getSeatLabel(Long seatId) {
        return seatRepository.findById(seatId)
                .map(s -> s.getRowLabel() + s.getSeatNumber())
                .orElse("Seat #" + seatId);
    }
}
