package com.intellecta.intellecta_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class TopicBulkSaveRequest {
    private List<@NotNull TopicStatusUpdate> updates;

    @Data
    public static class TopicStatusUpdate {
        @NotNull
        private Long id;

        @NotBlank
        private String status;
    }
}