
package com.intellecta.intellecta_backend.dto.request;

import com.intellecta.intellecta_backend.enums.CourseDifficulty;
import lombok.Data;
import java.time.LocalDate;

@Data
public class CourseRequest {
    private String courseName;
    private LocalDate examDate;
    private CourseDifficulty difficulty;
    private double plannedHoursPerDay;
}