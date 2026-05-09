package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.dto.response.BadgeDefinitionResponse;
import java.util.List;

public interface GamificationService {
    /**
     * Check all badge rules for the given user and award any newly qualified badges.
     * Returns the list of badges that were NEWLY awarded in this call (empty if none).
     */
    List<BadgeDefinitionResponse> checkAndAwardBadges(Long userId);
}
