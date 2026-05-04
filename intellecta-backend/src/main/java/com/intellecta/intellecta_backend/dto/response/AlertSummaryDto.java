package com.intellecta.intellecta_backend.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertSummaryDto {
    private Long id;
    private String title;
    private String description;
    private String time;       // e.g. "2 min ago"
    private String alertType;  // CRITICAL, WARNING, RESOLVED
    private String iconType;   // ANOMALY, PERFORMANCE, SECURITY
}
