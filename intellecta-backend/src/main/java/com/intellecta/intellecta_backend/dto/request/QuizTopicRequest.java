package com.intellecta.intellecta_backend.dto.request;

import com.intellecta.intellecta_backend.enums.TopicStatus;
import lombok.Data;

@Data
public class QuizTopicRequest {
    private String name;
    private String description;
    private TopicStatus status;
    private Long examId;
}
