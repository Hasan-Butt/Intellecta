package com.intellecta.intellecta_backend.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

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
}