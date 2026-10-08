package com.bookinstant.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatLockRequest {
    @NotNull(message = "showtimeId is required")
    private Object showtimeId;

    @NotEmpty(message = "seatIds cannot be empty")
    private List<Object> seatIds;

    @NotNull(message = "userId is required")
    private Object userId;

    public String getShowtimeIdStr() {
        return showtimeId != null ? String.valueOf(showtimeId) : "";
    }

    public List<String> getSeatIdStrs() {
        if (seatIds == null) return List.of();
        return seatIds.stream().map(String::valueOf).toList();
    }

    public String getUserIdStr() {
        return userId != null ? String.valueOf(userId) : "";
    }
}
