package com.intellecta.intellecta_backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ScheduleBlockDTO {
    private Long id;
    private String subject;
    private String topic;
    private String color;
    private String badge;
    private String duration;
}