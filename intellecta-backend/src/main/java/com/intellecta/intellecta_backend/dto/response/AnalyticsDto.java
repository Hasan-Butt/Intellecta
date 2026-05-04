package com.intellecta.intellecta_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class AnalyticsDto {
    private long totalUsers;
    private long activeUsers;
    private long inactiveUsers;
    private long studentCount;
    private long adminCount;
    private double activeUserPercentage;

    private long totalQuizzesTaken;
    private double averageQuizScore;
    private long totalQuestions;

    private List<Double> focusHistory;
    private double distractionsPerHour;
    private String distractionTrend;
    private List<DistractionSourceDto> distractionSources;

    private String dateFrom;
    private String dateTo;
}
