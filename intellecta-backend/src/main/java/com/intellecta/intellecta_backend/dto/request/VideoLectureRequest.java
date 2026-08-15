package com.intellecta.intellecta_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VideoLectureRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    // Full YouTube URL e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ
    // OR short form https://youtu.be/dQw4w9WgXcQ
    @NotBlank(message = "YouTube URL is required")
    private String youtubeUrl;

    @NotNull(message = "Course ID is required")
    private Long courseId;

    private Integer orderIndex; // optional: position within course playlist
}