package com.intellecta.intellecta_backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class FocusDayDTO {
    private String dayLabel;        // "Mon", "Tue" …
    private long   focusMinutes;
    private boolean hadDistraction;
}