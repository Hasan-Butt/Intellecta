package com.intellecta.intellecta_backend.dto.response;

import com.intellecta.intellecta_backend.dto.ResourceLinkDto;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class VideoLectureResponse {

    private Long id;
    private String title;
    private String description;
    private String youtubeUrl;
    private String youtubeVideoId;
    private String topic;           // plain string label, nullable
    private Integer orderIndex;
    private boolean published;
    private List<ResourceLinkDto> resourceLinks;
    private LocalDateTime createdAt;
}