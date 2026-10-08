package com.bookinstant.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatLockResponse {
    private Object showtimeId;
    private List<?> seatIds;
    private Object userId;
    private Long ttlSeconds;
    private LocalDateTime expiresAt;
    private String message;
}
