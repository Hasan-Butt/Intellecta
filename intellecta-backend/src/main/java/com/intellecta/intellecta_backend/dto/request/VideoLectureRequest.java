package com.intellecta.intellecta_backend.dto.request;

import com.intellecta.intellecta_backend.dto.ResourceLinkDto;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class VideoLectureRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "YouTube URL is required")
    private String youtubeUrl;

    // Optional label e.g. "DSA", "OOP", "Networking" — no FK, just a plain string
    private String topic;

    private Integer orderIndex;

    // Optional list of resource links (label + URL pairs)
    private List<ResourceLinkDto> resourceLinks = new ArrayList<>();
}