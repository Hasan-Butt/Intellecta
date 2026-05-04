package com.intellecta.intellecta_backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "system_config")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SystemConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private double deepWorkMultiplier;

    @Column(nullable = false)
    private double contextSwitchPenalty;

    @Column(nullable = false)
    private int idleDecayRate;

    @Column(nullable = false)
    private String leaderboardResetCycle;

    private LocalDateTime nextSyncWindow;
    private LocalDateTime lastDeployedAt;
    private String deployedBy;
}
