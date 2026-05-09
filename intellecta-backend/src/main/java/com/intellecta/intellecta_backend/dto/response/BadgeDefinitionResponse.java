package com.intellecta.intellecta_backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class BadgeDefinitionResponse {
    private Long   id;
    private String badgeKey;
    private String displayName;
    private String description;
    private String rarity;
    private Double targetPercentage;
    private String imageUrl;          // served URL, not file path
    private String ruleType;
    private int    ruleThreshold;
    private boolean systemDefined;

    // Analytics fields (null when not requested)
    private Long   unlockCount;       // number of users who earned this badge
    private Double unlockPercentage;  // unlockCount / totalUsers * 100

    // Student-view fields (null for admin views)
    private boolean earned;
    private LocalDateTime earnedAt;
}
