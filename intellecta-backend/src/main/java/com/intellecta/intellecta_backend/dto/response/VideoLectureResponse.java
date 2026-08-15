package com.intellecta.intellecta_backend.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class VideoLectureResponse {

    private Long id;
    private String title;
    private String description;
    private String youtubeUrl;
    private String youtubeVideoId;   // extracted 11-char ID, ready for embed
    private Long courseId;
    private String courseName;
    private Integer orderIndex;
    private boolean published;
    private LocalDateTime createdAt;
}