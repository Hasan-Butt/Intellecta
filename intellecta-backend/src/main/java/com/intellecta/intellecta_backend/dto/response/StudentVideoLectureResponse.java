package com.intellecta.intellecta_backend.dto.response;

import com.intellecta.intellecta_backend.dto.ResourceLinkDto;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO for a student's personal video lecture.
 * The "isStudentOwned" flag lets the frontend distinguish it from admin lectures.
 */
@Getter
@Builder
public class StudentVideoLectureResponse {

    private Long id;
    private String title;
    private String description;
    private String youtubeUrl;
    private String youtubeVideoId;
    private String topic;
    private Integer orderIndex;
    private List<ResourceLinkDto> resourceLinks;
    private LocalDateTime createdAt;

    /** Always true – used by the frontend to tag student-added lectures */
    @Builder.Default
    private boolean studentOwned = true;
}
