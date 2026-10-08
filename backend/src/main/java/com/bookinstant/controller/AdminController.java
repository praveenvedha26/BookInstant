package com.bookinstant.controller;

import com.bookinstant.dto.AdminHoldDto;
import com.bookinstant.dto.SeatLockRequest;
import com.bookinstant.entity.*;
import com.bookinstant.service.AuditLogService;
import com.bookinstant.service.CatalogService;
import com.bookinstant.service.SeatLockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.*;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class AdminController {

    private final SeatLockService seatLockService;
    private final AuditLogService auditLogService;
    private final CatalogService catalogService;

    /**
     * Inspect active Redis seat holds with live expiry countdowns
     */
    @GetMapping("/redis-holds")
    public ResponseEntity<List<AdminHoldDto>> getActiveRedisHolds() {
        return ResponseEntity.ok(seatLockService.getAllActiveHolds());
    }

    /**
     * Live Audit Table of recent reservation attempts:
     * [Timestamp | User ID | Seat ID | Action | Result Code (200 OK / 409 Conflict)]
     */
    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLog>> getAuditLogs() {
        return ResponseEntity.ok(auditLogService.getRecentAuditLogs());
    }

    /**
     * Catalog Manager: Create Movie
     */
    @PostMapping("/movies")
    public ResponseEntity<Movie> createMovie(@Valid @RequestBody Movie movie) {
        return ResponseEntity.ok(catalogService.saveMovie(movie));
    }

    /**
     * Catalog Manager: Create Theatre
     */
    @PostMapping("/theatres")
    public ResponseEntity<Theatre> createTheatre(@Valid @RequestBody Theatre theatre) {
        return ResponseEntity.ok(catalogService.saveTheatre(theatre));
    }

    /**
     * Catalog Manager: Create Showtime
     */
    @PostMapping("/showtimes")
    public ResponseEntity<Showtime> createShowtime(@Valid @RequestBody Showtime showtime) {
        return ResponseEntity.ok(catalogService.saveShowtime(showtime));
    }

    /**
     * Interactive Concurrency Benchmark Simulator:
     * Spawns multiple concurrent threads attempting to lock the exact same seat simultaneously.
     * Demonstrates distributed locking and 409 Conflict rejection under race conditions.
     */
    @PostMapping("/benchmark-concurrency")
    public ResponseEntity<Map<String, Object>> benchmarkConcurrency(
            @RequestParam(defaultValue = "1") Long showtimeId,
            @RequestParam(defaultValue = "15") Long targetSeatId
    ) {
        int threadCount = 2;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch startGate = new CountDownLatch(1);
        CountDownLatch endGate = new CountDownLatch(threadCount);

        List<Map<String, Object>> threadResults = new CopyOnWriteArrayList<>();

        // Worker A (User 101) and Worker B (User 102)
        long[] testUsers = new long[]{101L, 102L};

        for (int i = 0; i < threadCount; i++) {
            final long simUserId = testUsers[i];
            executor.submit(() -> {
                try {
                    startGate.await(); // Synchronize start for pure race condition
                    try {
                        var res = seatLockService.lockSeats(SeatLockRequest.builder()
                                .showtimeId(showtimeId)
                                .seatIds(List.of(targetSeatId))
                                .userId(simUserId)
                                .build());
                        threadResults.add(Map.of(
                                "userId", simUserId,
                                "status", "SUCCESS",
                                "httpCode", 200,
                                "message", "Acquired distributed lock and placed 10-min hold."
                        ));
                    } catch (Exception e) {
                        threadResults.add(Map.of(
                                "userId", simUserId,
                                "status", "CONFLICT",
                                "httpCode", 409,
                                "message", e.getMessage()
                        ));
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                } finally {
                    endGate.countDown();
                }
            });
        }

        startGate.countDown(); // Release threads simultaneously
        try {
            endGate.await(5, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        executor.shutdown();

        return ResponseEntity.ok(Map.of(
                "testedShowtimeId", showtimeId,
                "targetSeatId", targetSeatId,
                "concurrentThreads", threadCount,
                "results", threadResults,
                "auditLogged", true
        ));
    }
}
