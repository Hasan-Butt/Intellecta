package com.intellecta.intellecta_backend.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.intellecta.intellecta_backend.enums.NoteCategory;
import lombok.Data;
import java.util.List;

@Data
public class NoteRequest {
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
}