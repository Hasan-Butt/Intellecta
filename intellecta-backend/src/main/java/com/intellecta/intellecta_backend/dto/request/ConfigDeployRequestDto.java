package com.intellecta.intellecta_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ConfigDeployRequestDto(
    double deepWorkMultiplier,
    double contextSwitchPenalty,
    int    idleDecayRate,
    @NotBlank @Size(max = 50) String leaderboardResetCycle
) {}
