package com.intellecta.intellecta_backend.dto.request;

import lombok.Data;

@Data
public class ExamRequest {
    private String name;
    private String examDate; // "YYYY-MM-DD"
    private Long subjectId;
}