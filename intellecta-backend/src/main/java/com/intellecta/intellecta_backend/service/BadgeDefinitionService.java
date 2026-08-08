package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.dto.request.BadgeDefinitionRequest;
import com.intellecta.intellecta_backend.dto.response.BadgeDefinitionResponse;

import java.util.List;

public interface BadgeDefinitionService {

    /** All badge definitions with unlock analytics (admin view) */
    List<BadgeDefinitionResponse> getAllBadges();

    /** Create a new custom badge */
    BadgeDefinitionResponse createBadge(BadgeDefinitionRequest req);

    /** Update editable fields of a badge */
    BadgeDefinitionResponse updateBadge(String badgeKey, BadgeDefinitionRequest req);

    /**
     * Set the badge image to an UploadThing CDN URL.
     * Replaces the old uploadImage(MultipartFile) method.
     */
    BadgeDefinitionResponse setImageUrl(String badgeKey, String imageUrl);

    /** Delete a custom (non-system) badge */
    void deleteBadge(String badgeKey);

    /** All badges with student earned/locked status overlay */
    List<BadgeDefinitionResponse> getAllBadgesForStudent(Long userId);

    /** Resolve image URL from badgeKey */
    String getImageUrl(String badgeKey);
}
