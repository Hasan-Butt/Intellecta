package com.intellecta.intellecta_backend.dto.request;

public record ConfigDeployRequestDto(
    double deepWorkMultiplier,
    double contextSwitchPenalty,
    int    idleDecayRate,
    String leaderboardResetCycle
) {}
