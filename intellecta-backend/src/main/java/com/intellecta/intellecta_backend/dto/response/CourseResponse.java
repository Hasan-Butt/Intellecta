package com.intellecta.intellecta_backend.dto.response;

import com.intellecta.intellecta_backend.enums.CourseDifficulty;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Data
@Builder
public class CourseResponse {
    private Long id;
    private String courseName;
    private LocalDate examDate;
    private CourseDifficulty difficulty;
    private double plannedHoursPerDay;
    private long daysUntilExam;
    private int masteryPct; // placeholder, always 0 until coverage tracker is built
}