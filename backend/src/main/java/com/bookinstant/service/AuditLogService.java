package com.bookinstant.service;

import com.bookinstant.entity.AuditLog;
import com.bookinstant.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public AuditLog record(String userId, String seatIds, String action, int resultCode, String details) {
        AuditLog auditLog = AuditLog.builder()
                .timestamp(LocalDateTime.now())
                .userId(userId)
                .seatIds(seatIds)
                .action(action)
                .resultCode(resultCode)
                .details(details)
                .build();

        log.info("[AUDIT] Action: {} | User: {} | Seats: {} | Code: {} | Details: {}", 
                action, userId, seatIds, resultCode, details);
        return auditLogRepository.save(auditLog);
    }

    public List<AuditLog> getRecentAuditLogs() {
        return auditLogRepository.findTop50ByOrderByTimestampDesc();
    }
}
