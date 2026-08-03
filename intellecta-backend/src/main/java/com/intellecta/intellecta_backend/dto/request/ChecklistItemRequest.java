package com.intellecta.intellecta_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChecklistItemRequest {
    @NotBlank @Size(max = 500)
    private String description;
}