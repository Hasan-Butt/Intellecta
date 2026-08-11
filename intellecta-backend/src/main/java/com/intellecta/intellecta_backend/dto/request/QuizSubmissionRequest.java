package com.intellecta.intellecta_backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizSubmissionRequest {
    @NotNull
    private Long userId;

    @NotNull
    private Long quizId;

    private Map<Long, Integer> answers; // questionId -> selectedOptionIndex

    private Map<Long, String> textAnswers; // questionId -> raw student text (descriptive)

    private Long startedAt; // epoch millis when the student began the attempt (client-side)
}