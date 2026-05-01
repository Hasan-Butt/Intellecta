package com.intellecta.intellecta_backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class TopicResponse {
    private Long id;
    private String title;
    private String description;
    private String status;
    private Long subjectId;
    private Long examId; // null if general topic
}