package com.intellecta.intellecta_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class BadgeDefinitionRequest {
    @NotBlank @Size(max = 100)
    private String displayName;

    @Size(max = 500)
    private String description;

    @NotBlank
    private String rarity;

    private Double targetPercentage;
    private String ruleType;
    private int    ruleThreshold;
    private String badgeKey;
}
