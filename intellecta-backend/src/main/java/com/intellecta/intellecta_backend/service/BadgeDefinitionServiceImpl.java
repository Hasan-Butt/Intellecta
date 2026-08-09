package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.dto.request.BadgeDefinitionRequest;
import com.intellecta.intellecta_backend.dto.response.BadgeDefinitionResponse;
import com.intellecta.intellecta_backend.model.Achievement;
import com.intellecta.intellecta_backend.model.BadgeDefinition;
import com.intellecta.intellecta_backend.repository.AchievementRepository;
import com.intellecta.intellecta_backend.repository.BadgeDefinitionRepository;
import com.intellecta.intellecta_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BadgeDefinitionServiceImpl implements BadgeDefinitionService {

    private final BadgeDefinitionRepository badgeRepo;
    private final AchievementRepository     achievementRepo;
    private final UserRepository            userRepo;

    // ── Admin: list all ──────────────────────────────────────────────────────

    @Override
    public List<BadgeDefinitionResponse> getAllBadges() {
        long totalUsers = userRepo.count();
        return badgeRepo.findAllByOrderByRarityAscDisplayNameAsc()
                .stream()
                .map(b -> toResponse(b, totalUsers, null, null))
                .collect(Collectors.toList());
    }

    // ── Admin: create ────────────────────────────────────────────────────────

    @Override
    public BadgeDefinitionResponse createBadge(BadgeDefinitionRequest req) {
        if (req.getBadgeKey() == null || req.getBadgeKey().isBlank())
            throw new IllegalArgumentException("badgeKey is required for new badges");
        if (badgeRepo.existsByBadgeKey(req.getBadgeKey()))
            throw new IllegalArgumentException("Badge key already exists: " + req.getBadgeKey());

        BadgeDefinition def = BadgeDefinition.builder()
                .badgeKey(req.getBadgeKey().toUpperCase().replace(" ", "_"))
                .displayName(req.getDisplayName())
                .description(req.getDescription())
                .rarity(req.getRarity() != null ? req.getRarity() : "COMMON")
                .targetPercentage(req.getTargetPercentage())
                .ruleType(req.getRuleType() != null ? req.getRuleType() : "TOTAL_SESSIONS")
                .ruleThreshold(req.getRuleThreshold() > 0 ? req.getRuleThreshold() : 1)
                .systemDefined(false)
                .build();

        return toResponse(badgeRepo.save(def), userRepo.count(), null, null);
    }

    // ── Admin: update ────────────────────────────────────────────────────────

    @Override
    public BadgeDefinitionResponse updateBadge(String badgeKey, BadgeDefinitionRequest req) {
        BadgeDefinition def = badgeRepo.findByBadgeKey(badgeKey)
                .orElseThrow(() -> new RuntimeException("Badge not found: " + badgeKey));

        if (req.getDisplayName()      != null) def.setDisplayName(req.getDisplayName());
        if (req.getDescription()      != null) def.setDescription(req.getDescription());
        if (req.getRarity()           != null) def.setRarity(req.getRarity());
        if (req.getTargetPercentage() != null) def.setTargetPercentage(req.getTargetPercentage());
        if (req.getRuleType()         != null) def.setRuleType(req.getRuleType());
        if (req.getRuleThreshold()    >  0)    def.setRuleThreshold(req.getRuleThreshold());

        return toResponse(badgeRepo.save(def), userRepo.count(), null, null);
    }

    // ── Admin: set image URL (UploadThing) ───────────────────────────────────

    @Override
    public BadgeDefinitionResponse setImageUrl(String badgeKey, String imageUrl) {
        BadgeDefinition def = badgeRepo.findByBadgeKey(badgeKey)
                .orElseThrow(() -> new RuntimeException("Badge not found: " + badgeKey));

        if (imageUrl == null || imageUrl.isBlank())
            throw new IllegalArgumentException("imageUrl must not be blank");

        def.setImageUrl(imageUrl);
        return toResponse(badgeRepo.save(def), userRepo.count(), null, null);
    }

    // ── Admin: delete ────────────────────────────────────────────────────────

    @Override
    public void deleteBadge(String badgeKey) {
        BadgeDefinition def = badgeRepo.findByBadgeKey(badgeKey)
                .orElseThrow(() -> new RuntimeException("Badge not found: " + badgeKey));
        if (def.isSystemDefined())
            throw new IllegalStateException("Cannot delete system-defined badges");
        badgeRepo.delete(def);
    }

    // ── Student: all badges with earned status ───────────────────────────────

    @Override
    public List<BadgeDefinitionResponse> getAllBadgesForStudent(Long userId) {
        List<Achievement> earned = achievementRepo.findByUserIdOrderByEarnedAtDesc(userId);
        Map<String, Achievement> earnedMap = earned.stream()
                .collect(Collectors.toMap(Achievement::getBadgeName, a -> a, (a, b) -> a));

        long totalUsers = userRepo.count();
        return badgeRepo.findAllByOrderByRarityAscDisplayNameAsc()
                .stream()
                .map(b -> {
                    Achievement a = earnedMap.get(b.getBadgeKey());
                    return toResponse(b, totalUsers,
                            a != null,
                            a != null ? a.getEarnedAt() : null);
                })
                .collect(Collectors.toList());
    }

    // ── Public: image URL ────────────────────────────────────────────────────

    @Override
    public String getImageUrl(String badgeKey) {
        return badgeRepo.findByBadgeKey(badgeKey)
                .map(BadgeDefinition::getImageUrl)
                .orElse(null);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private BadgeDefinitionResponse toResponse(BadgeDefinition def, long totalUsers,
                                               Boolean earned, java.time.LocalDateTime earnedAt) {
        long unlockCount = achievementRepo.countByBadgeName(def.getBadgeKey());
        double unlockPct = totalUsers > 0 ? (unlockCount * 100.0 / totalUsers) : 0;

        return BadgeDefinitionResponse.builder()
                .id(def.getId())
                .badgeKey(def.getBadgeKey())
                .displayName(def.getDisplayName())
                .description(def.getDescription())
                .rarity(def.getRarity())
                .targetPercentage(def.getTargetPercentage())
                .imageUrl(def.getImageUrl())   // Direct CDN URL — no construction needed
                .ruleType(def.getRuleType())
                .ruleThreshold(def.getRuleThreshold())
                .systemDefined(def.isSystemDefined())
                .unlockCount(unlockCount)
                .unlockPercentage(Math.round(unlockPct * 10.0) / 10.0)
                .earned(earned != null && earned)
                .earnedAt(earnedAt)
                .build();
    }
}
