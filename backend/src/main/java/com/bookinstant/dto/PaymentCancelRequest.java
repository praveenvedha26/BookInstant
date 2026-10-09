package com.bookinstant.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentCancelRequest {
    @NotNull(message = "showtimeId is required")
    private Object showtimeId;

    @NotEmpty(message = "seatIds cannot be empty")
    private List<Object> seatIds;

    @NotNull(message = "userId is required")
    private Object userId;

    private String reason;

    public String getShowtimeIdStr() {
        return showtimeId != null ? String.valueOf(showtimeId) : "";
    }

    public Long getNumericShowtimeId() {
        if (showtimeId == null) return 1L;
        String str = String.valueOf(showtimeId);
        try {
            return Long.parseLong(str);
        } catch (Exception e) {
            Matcher m = Pattern.compile("(\\d+)").matcher(str);
            if (m.find()) {
                try {
                    return Long.parseLong(m.group(1));
                } catch (Exception ignored) {}
            }
        }
        return 1L;
    }

    public List<Long> getSeatIdLongs() {
        List<Long> result = new ArrayList<>();
        if (seatIds == null) return result;
        for (Object s : seatIds) {
            if (s == null) continue;
            String str = String.valueOf(s);
            try {
                result.add(Long.parseLong(str));
            } catch (Exception e) {
                Matcher m = Pattern.compile("(\\d+)").matcher(str);
                if (m.find()) {
                    try {
                        result.add(Long.parseLong(m.group(1)));
                    } catch (Exception ignored) {}
                }
            }
        }
        return result;
    }

    public Long getNumericUserId() {
        if (userId == null) return 1L;
        String str = String.valueOf(userId);
        try {
            return Long.parseLong(str);
        } catch (Exception e) {
            Matcher m = Pattern.compile("(\\d+)").matcher(str);
            if (m.find()) {
                try {
                    return Long.parseLong(m.group(1));
                } catch (Exception ignored) {}
            }
        }
        return 1L;
    }
}
