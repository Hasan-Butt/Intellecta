package com.intellecta.intellecta_backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record ProfileUpdateDto(
    @Size(max = 50) String username,
    @Email @Size(max = 100) String email,
    @Size(max = 1000) String bio,
    String avatarUrl,
    Boolean studyReminders,
    Boolean achievementAlerts,
    Boolean weeklyReports,
    Boolean anonymousMode
) {}
