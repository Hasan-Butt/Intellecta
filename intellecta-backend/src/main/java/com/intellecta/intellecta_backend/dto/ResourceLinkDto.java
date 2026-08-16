package com.intellecta.intellecta_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Represents a single resource link with a human-readable label and a URL.
 * Used in both VideoLectureRequest and VideoLectureResponse.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ResourceLinkDto {
    private String label;
    private String url;
}
