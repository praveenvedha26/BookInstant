package com.bookinstant.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentConfirmResponse {
    private Long bookingId;
    private Long showtimeId;
    private String movieTitle;
    private String theatreName;
    private String screenName;
    private String city;
    private LocalDateTime startTime;
    private List<String> seatLabels;
    private BigDecimal totalAmount;
    private String status;
    private String qrCodeToken;
    private LocalDateTime createdAt;
    private String message;
}
