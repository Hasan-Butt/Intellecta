package com.intellecta.intellecta_backend.dto.response;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardDto {
    private long activeEngagement;
    private double engagementTrend;
    private double avgFocusScore;
    private long concurrentSessions;
    private List<Long> weeklyVelocity;    // 7 values Mon–Sun, raw study minutes
    private List<Integer> peakStudyTimes; // 42 values (7 days × 6 time slots), range 0–4
    private List<AlertSummaryDto> alerts;
}
