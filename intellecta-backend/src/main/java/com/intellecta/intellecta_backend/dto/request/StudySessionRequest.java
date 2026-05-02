package com.intellecta.intellecta_backend.dto.request;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class StudySessionRequest {
    private String        subject;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private int           pomodorosCompleted;
    private boolean       deepWork;
}