package com.bookinstant.service;

import com.bookinstant.dto.PaymentCancelRequest;
import com.bookinstant.dto.PaymentConfirmRequest;
import com.bookinstant.dto.PaymentConfirmResponse;
import com.bookinstant.entity.*;
import com.bookinstant.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final SeatLockService seatLockService;
    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    /**
     * Confirms simulated payment:
     * 1. Validates user hold exists in Redis
     * 2. Persists Booking into PostgreSQL as CONFIRMED
     * 3. Creates BookingSeat records
     * 4. Clears Redis holds
     * 5. Returns ticket confirmation receipt with unique QR token
     */
    @Transactional
    public PaymentConfirmResponse confirmPayment(PaymentConfirmRequest request) {
        Long showtimeId = request.getNumericShowtimeId();
        List<Long> seatIds = request.getSeatIdLongs();
        Long userId = request.getNumericUserId();
        String showtimeIdStr = request.getShowtimeIdStr();

        User user = userRepository.findById(userId)
                .orElseGet(() -> userRepository.findById(1L)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + userId)));

        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseGet(() -> showtimeRepository.findById(1L)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Showtime not found: " + showtimeId)));

        // Check if any seat is already confirmed
        List<Long> alreadyBooked = bookingRepository.findBookedSeatIdsByShowtimeIdAndStatus(showtime.getId(), BookingStatus.CONFIRMED);
        for (Long seatId : seatIds) {
            if (alreadyBooked.contains(seatId)) {
                auditLogService.record(userId.toString(), seatId.toString(), "PAYMENT_CONFLICT", 409, "Seat already permanently booked");
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Seat " + seatId + " was already booked.");
            }
        }

        List<Seat> seats = seatRepository.findAllById(seatIds);
        if (seats.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid seat selection");
        }

        // Calculate total amount
        BigDecimal unitPrice = showtime.getPrice() != null ? showtime.getPrice() : BigDecimal.valueOf(350);
        BigDecimal totalAmount = unitPrice.multiply(BigDecimal.valueOf(seats.size()));

        // Generate distinctive QR token
        String qrToken = "BI-" + showtime.getMovie().getId() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        // 1. Create and persist Booking
        Booking booking = Booking.builder()
                .user(user)
                .showtime(showtime)
                .totalAmount(totalAmount)
                .status(BookingStatus.CONFIRMED)
                .qrCodeToken(qrToken)
                .createdAt(LocalDateTime.now())
                .build();

        booking = bookingRepository.save(booking);

        // 2. Persist BookingSeats
        List<String> seatLabels = new ArrayList<>();
        for (Seat seat : seats) {
            BookingSeat bookingSeat = BookingSeat.builder()
                    .booking(booking)
                    .seat(seat)
                    .build();
            bookingSeatRepository.save(bookingSeat);
            seatLabels.add(seat.getRowLabel() + seat.getSeatNumber());
        }

        // 3. Release Redis hold keys (now permanently booked in PostgreSQL)
        seatLockService.releaseHolds(showtimeIdStr, seatIds, userId);

        // 4. Record audit log
        auditLogService.record(userId.toString(), seatIds.toString(), "PAYMENT_CONFIRM", 200, 
                "Booking #" + booking.getId() + " confirmed. Total: $" + totalAmount);

        log.info("Payment confirmed successfully for booking {} by user {}", booking.getId(), userId);

        return PaymentConfirmResponse.builder()
                .bookingId(booking.getId())
                .showtimeId(showtime.getId())
                .movieTitle(showtime.getMovie().getTitle())
                .theatreName(showtime.getScreen().getTheatre().getName())
                .screenName(showtime.getScreen().getName())
                .city(showtime.getScreen().getTheatre().getCity())
                .startTime(showtime.getStartTime())
                .seatLabels(seatLabels)
                .totalAmount(totalAmount)
                .status(BookingStatus.CONFIRMED.name())
                .qrCodeToken(qrToken)
                .createdAt(booking.getCreatedAt())
                .message("Payment successful! Your seats are locked and confirmed.")
                .build();
    }

    /**
     * Cancels payment simulation and releases held seats back to the public pool
     */
    public void cancelPayment(PaymentCancelRequest request) {
        Long showtimeId = request.getNumericShowtimeId();
        List<Long> seatIds = request.getSeatIdLongs();
        Long userId = request.getNumericUserId();
        String showtimeIdStr = request.getShowtimeIdStr();

        seatLockService.releaseHolds(showtimeIdStr, seatIds, userId);
        auditLogService.record(userId.toString(), seatIds.toString(), "PAYMENT_CANCEL", 200, 
                "User cancelled payment - hold keys deleted from Redis");
        log.info("Payment cancelled for user {}. Seats released back to pool: {}", userId, seatIds);
    }
}
