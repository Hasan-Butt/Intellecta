package com.intellecta.intellecta_backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GradeSubmissionRequest {
    @NotNull
    private Long attemptId;

    @NotNull
    private Map<Long, Integer> questionMarks; // questionId -> awarded marks (descriptive only)
}