package com.intellecta.intellecta_backend.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data @Builder
public class PlatformStatsDTO {
    private long totalUsers;
    private long activeSessions;
    private double averageQuizScore;
    private List<String> topPerformers;
}