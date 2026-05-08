package com.intellecta.intellecta_backend.dto.response;

import java.time.LocalDate;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ScheduleBlockResponse {
    private String courseName;
    private LocalDate date;
    private String dayLabel;       // "Mon", "Tue" …
    private double hoursAllocated;
    private String priority;       // "HIGH" | "MEDIUM" | "LOW"
    private long daysUntilExam;
}