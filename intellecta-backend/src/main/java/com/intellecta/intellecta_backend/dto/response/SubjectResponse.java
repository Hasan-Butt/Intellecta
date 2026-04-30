package com.intellecta.intellecta_backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class SubjectResponse {
    private Long id;
    private String name;
    private String semester;
    private String color;
    private long documentCount; // how many files in this subject
}