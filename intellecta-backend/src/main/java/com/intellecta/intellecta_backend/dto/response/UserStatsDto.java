package com.intellecta.intellecta_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UserStatsDto {
    private long totalStudents;
    private long totalActiveUsers;
    private long totalAdmins;
    private double avgFocusScore;
    private long downwardTrendStudents;
    private String userGrowthLabel;
    private String focusTrendLabel;
    private String sessionTrendLabel;
    private String syncStatus;
    private String dbLatency;
    private String storageCapacity;
    private String lastMaintenance;
}
