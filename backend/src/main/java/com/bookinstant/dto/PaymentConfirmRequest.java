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
public class PaymentConfirmRequest {
    @NotNull(message = "showtimeId is required")
    private Long showtimeId;

    @NotEmpty(message = "seatIds cannot be empty")
    private List<Long> seatIds;

    @NotNull(message = "userId is required")
    private Long userId;

    private String paymentMethod; // e.g. "UPI", "CREDIT_CARD", "MOCK_WALLET"
}
