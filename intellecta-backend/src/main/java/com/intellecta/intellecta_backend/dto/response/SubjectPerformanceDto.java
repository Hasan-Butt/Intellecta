package com.intellecta.intellecta_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class SubjectPerformanceDto {
    private String subjectName;
    private double averageScore;
    private long attempts;
    private String color;
}
