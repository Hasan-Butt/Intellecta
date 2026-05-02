package com.intellecta.intellecta_backend.dto.response;

import java.time.LocalDate;

import com.intellecta.intellecta_backend.enums.CourseDifficulty;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CourseResponse {
    private Long id;
    private String courseName;
    private LocalDate examDate;
    private CourseDifficulty difficulty;
    private double plannedHoursPerDay;
    private long daysUntilExam;
}