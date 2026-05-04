package com.intellecta.intellecta_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class StudentPerformanceDto {
    private Long id;
    private String username;
    private String email;
    private double averageScore;
    private long quizAttempts;
    private String trend; // "UP", "DOWN", "STABLE"
    private String status;
    private List<Double> scoreHistory;
}
