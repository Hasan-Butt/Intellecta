package com.intellecta.intellecta_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class AnalyticsDto {
    private long totalUsers;
    private long activeUsers;
    private long inactiveUsers;
    private long studentCount;
    private long adminCount;
    private double activeUserPercentage;

    // Quiz stats (populated when quiz module is built)
    private long totalQuizzesTaken;
    private double averageQuizScore;
    private long totalQuestions;

    private String dateFrom;
    private String dateTo;
}
