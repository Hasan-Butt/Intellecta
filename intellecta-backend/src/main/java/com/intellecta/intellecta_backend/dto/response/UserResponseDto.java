package com.intellecta.intellecta_backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserResponseDto {
    private Long id;
    private String username;
    private String email;
    private String role;
    private String status;
    private String bio;
    private String avatarUrl;
    private boolean hasPassword;
    private boolean studyReminders;
    private boolean achievementAlerts;
    private boolean weeklyReports;
    private int streakDays;
    private boolean anonymousMode;
}