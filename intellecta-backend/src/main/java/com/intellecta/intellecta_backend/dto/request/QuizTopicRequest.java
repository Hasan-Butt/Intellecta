package com.intellecta.intellecta_backend.dto.request;

import com.intellecta.intellecta_backend.enums.TopicStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class QuizTopicRequest {
    @NotBlank @Size(max = 200)
    private String name;

    @Size(max = 2000)
    private String description;

    private TopicStatus status;
    private Long examId;
}
