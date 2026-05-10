package com.intellecta.intellecta_backend.dto.request;

public record ProfileUpdateDto(
    String username,
    String email,
    String bio,
    String avatarUrl,
    Boolean studyReminders,
    Boolean achievementAlerts,
    Boolean weeklyReports
) {}
