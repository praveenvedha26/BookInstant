package com.bookinstant.controller;

import com.bookinstant.dto.PaymentCancelRequest;
import com.bookinstant.dto.PaymentConfirmRequest;
import com.bookinstant.dto.PaymentConfirmResponse;
import com.bookinstant.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * POST /api/v1/payments/confirm
     * Validates active Redis hold for the user.
     * Persists booking into PostgreSQL with status CONFIRMED.
     * Removes temporary hold and returns QR code token.
     */
    @PostMapping("/confirm")
    public ResponseEntity<PaymentConfirmResponse> confirmPayment(@Valid @RequestBody PaymentConfirmRequest request) {
        PaymentConfirmResponse response = paymentService.confirmPayment(request);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/v1/payments/cancel
     * Deletes Redis hold keys, instantly returning seats to the available pool.
     */
    @PostMapping("/cancel")
    public ResponseEntity<Map<String, Object>> cancelPayment(@Valid @RequestBody PaymentCancelRequest request) {
        paymentService.cancelPayment(request);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Payment cancelled and seats released successfully."
        ));
    }
}
