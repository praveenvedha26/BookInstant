package com.bookinstant.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminHoldDto {
    private String redisKey;
    private Long showtimeId;
    private Long seatId;
    private String seatLabel;
    private Long userId;
    private Long ttlSeconds;
    private String formattedTtl;
}
