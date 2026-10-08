package com.bookinstant.controller;

import com.bookinstant.dto.SeatLockRequest;
import com.bookinstant.dto.SeatLockResponse;
import com.bookinstant.dto.SeatStatusDto;
import com.bookinstant.service.SeatLockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/seats")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SeatLockController {

    private final SeatLockService seatLockService;

    /**
     * POST /api/v1/seats/lock
     * Request Body: { showtimeId, seatIds: [], userId }
     * Acquires Redisson lock, checks Redis holds, sets 10-minute TTL hold or returns 409 Conflict
     */
    @PostMapping("/lock")
    public ResponseEntity<SeatLockResponse> lockSeats(@Valid @RequestBody SeatLockRequest request) {
        SeatLockResponse response = seatLockService.lockSeats(request);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/v1/seats/showtime/{showtimeId}?userId={userId}
     * GET /api/v1/seats/status/{showtimeId}?userId={userId}
     * Returns seat map with state: AVAILABLE (White), HELD/LOCKED (Yellow & Disabled), SELECTED (Green), BOOKED (Red)
     */
    @GetMapping({"/showtime/{showtimeId}", "/status/{showtimeId}"})
    public ResponseEntity<List<SeatStatusDto>> getSeatsStatus(
            @PathVariable String showtimeId,
            @RequestParam(required = false) String userId
    ) {
        List<SeatStatusDto> seats = seatLockService.getSeatsStatus(showtimeId, userId);
        return ResponseEntity.ok(seats);
    }
}
