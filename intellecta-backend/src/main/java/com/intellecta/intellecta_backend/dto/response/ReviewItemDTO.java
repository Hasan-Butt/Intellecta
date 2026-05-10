package com.intellecta.intellecta_backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class ReviewItemDTO {
    private Long    id;
    private String  title;
    private String  content;   // actual note body — shown on card flip
    private String  subtitle;  // time-ago label for the dashboard card
    private boolean urgent;
}