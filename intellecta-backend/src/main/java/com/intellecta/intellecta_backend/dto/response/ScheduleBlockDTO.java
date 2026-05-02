package com.intellecta.intellecta_backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class ScheduleBlockDTO {
    private Long   id;
    private String time;            // "09:00 AM"
    private String subject;
    private String topic;
    private String color;           // hex
    private String badge;           // "Active" or null
    private String duration;        // "90 mins" or null
}