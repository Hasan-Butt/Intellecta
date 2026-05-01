package com.intellecta.intellecta_backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class ExamResponse {
    private Long id;
    private String name;
    private String examDate; // "YYYY-MM-DD"
    private Long subjectId;
    private String subjectName;
    private long daysLeft;
}