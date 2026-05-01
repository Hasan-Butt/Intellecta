package com.intellecta.intellecta_backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class ChecklistItemResponse {
    private Long id;
    private String description;
    private boolean done;
    private Long examId;
}