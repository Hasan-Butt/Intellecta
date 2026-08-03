package com.intellecta.intellecta_backend.dto.request;

import com.intellecta.intellecta_backend.enums.CourseDifficulty;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDate;

@Data
public class CourseRequest {
    @NotBlank @Size(max = 200)
    private String courseName;

    @NotNull
    private LocalDate examDate;

    @NotNull
    private CourseDifficulty difficulty;

    @Min(0) @Max(24)
    private double plannedHoursPerDay;
}