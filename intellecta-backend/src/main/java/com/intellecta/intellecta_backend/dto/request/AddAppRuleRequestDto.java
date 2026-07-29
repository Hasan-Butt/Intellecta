package com.intellecta.intellecta_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AddAppRuleRequestDto(
    @NotBlank @Size(max = 100) String appName,
    @NotBlank @Size(max = 50) String type
) {}
