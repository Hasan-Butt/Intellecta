package com.intellecta.intellecta_backend.dto.request;

import lombok.Data;

@Data
public class DistractionRequest {
    private String reason;
    private String duration;
    private String impact;
}