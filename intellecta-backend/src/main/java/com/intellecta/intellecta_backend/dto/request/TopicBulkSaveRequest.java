package com.intellecta.intellecta_backend.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class TopicBulkSaveRequest {
    private List<TopicStatusUpdate> updates;

    @Data
    public static class TopicStatusUpdate {
        private Long id;
        private String status;
    }
}