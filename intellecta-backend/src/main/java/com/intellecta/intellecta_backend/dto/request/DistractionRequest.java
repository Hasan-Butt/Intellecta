package com.intellecta.intellecta_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class DistractionRequest {
    @NotBlank @Size(max = 500)
    private String reason;

    @Size(max = 50)
    private String duration;

    @Size(max = 50)
    private String impact;
}