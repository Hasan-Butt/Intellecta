package com.intellecta.intellecta_backend.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class StudySessionResponse {
    private Long id;
    private String subject;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private int pomodorosCompleted;
    private boolean deepWork;
    private long durationMinutes;
    /** Badges newly earned as a result of ending this session */
    @Builder.Default
    private List<BadgeDefinitionResponse> newBadges = new java.util.ArrayList<>();
}