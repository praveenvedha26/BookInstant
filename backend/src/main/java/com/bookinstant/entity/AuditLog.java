package com.bookinstant.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "user_id", nullable = false, length = 100)
    private String userId;

    @Column(name = "seat_ids", nullable = false)
    private String seatIds;

    @Column(nullable = false, length = 50)
    private String action; // "SEAT_LOCK_ATTEMPT", "SEAT_PAYMENT_CONFIRM", "SEAT_RELEASE"

    @Column(name = "result_code", nullable = false)
    private Integer resultCode; // 200, 409, 400

    @Column(length = 255)
    private String details;

    @PrePersist
    public void prePersist() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
}
