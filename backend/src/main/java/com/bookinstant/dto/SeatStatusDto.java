package com.bookinstant.dto;

import com.bookinstant.entity.SeatType;
import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatStatusDto {
    private Long id;
    private String rowLabel;
    private Integer seatNumber;
    private String seatLabel; // e.g. "G12"
    private SeatType seatType;
    private BigDecimal price;
    private String status; // "AVAILABLE", "HELD", "LOCKED", "BOOKED", "SELECTED"
    private Long heldBy; // User ID who holds the lock in Redis
    private Long lockedByUserId; // Alias for heldBy
    private String heldByName; // User display name
    private Long remainingHoldSeconds;
}
