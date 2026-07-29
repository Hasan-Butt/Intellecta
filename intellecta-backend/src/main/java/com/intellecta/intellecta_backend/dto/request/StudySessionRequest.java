package com.intellecta.intellecta_backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class StudySessionRequest {
    @NotBlank @Size(max = 100)
    private String subject;

    @NotNull
    private LocalDateTime startTime;

    private LocalDateTime endTime;

    @Min(0)
    private int pomodorosCompleted;

    private boolean deepWork;
}