package com.intellecta.intellecta_backend.dto.response;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SystemConfigDto {
    private Long   id;
    private double deepWorkMultiplier;
    private double contextSwitchPenalty;
    private int    idleDecayRate;
    private String leaderboardResetCycle;
    private String nextSyncWindow;
    private String lastDeployedAt;
    private String deployedBy;
}
