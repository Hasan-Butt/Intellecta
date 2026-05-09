package com.intellecta.intellecta_backend.dto.request;

import lombok.Data;

@Data
public class BadgeDefinitionRequest {
    private String displayName;
    private String description;
    /** COMMON | RARE | EPIC | LEGENDARY */
    private String rarity;
    private Double targetPercentage;
    /** Rule type — see BadgeDefinition.ruleType javadoc */
    private String ruleType;
    private int    ruleThreshold;
    /** Required only for creating new badges (not for updates) */
    private String badgeKey;
}
