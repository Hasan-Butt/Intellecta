package com.intellecta.intellecta_backend.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.intellecta.intellecta_backend.enums.NoteCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.List;

@Data
public class NoteRequest {
    @NotBlank @Size(max = 300)
    private String title;

    @Size(max = 5_000_000)
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