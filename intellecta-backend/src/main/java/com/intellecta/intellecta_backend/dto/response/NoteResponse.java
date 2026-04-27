package com.intellecta.intellecta_backend.dto.response;

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
    private boolean isPinned;
    private boolean isSpecial;
    private boolean flaggedForReview;
    private List<String> tags;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}