package com.intellecta.intellecta_backend.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.intellecta.intellecta_backend.enums.NoteCategory;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder
public class NoteResponse {
    private Long id;
    private String title;
    private String content;
    private NoteCategory category;
    private String source;

    @JsonProperty("isPinned")
    private boolean isPinned;

    @JsonProperty("isSpecial")
    private boolean isSpecial;

    private boolean flaggedForReview;
    private List<String> tags;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}