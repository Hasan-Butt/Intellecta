package com.intellecta.intellecta_backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizSubmissionRequest {
    private Long userId;
    private Long quizId;
    private Map<Long, Integer> answers; // questionId -> selectedOptionIndex
}