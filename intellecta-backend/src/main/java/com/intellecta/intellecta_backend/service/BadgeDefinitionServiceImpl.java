package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.dto.request.BadgeDefinitionRequest;
import com.intellecta.intellecta_backend.dto.response.BadgeDefinitionResponse;
import com.intellecta.intellecta_backend.model.Achievement;
import com.intellecta.intellecta_backend.model.BadgeDefinition;
import com.intellecta.intellecta_backend.repository.AchievementRepository;
import com.intellecta.intellecta_backend.repository.BadgeDefinitionRepository;
import com.intellecta.intellecta_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BadgeDefinitionServiceImpl implements BadgeDefinitionService {

    private final BadgeDefinitionRepository badgeRepo;
    private final AchievementRepository     achievementRepo;
    private final UserRepository            userRepo;

    @Value("${badge.upload.dir:uploads/badges}")
    private String uploadDir;

    @Value("${badge.serve.base-url:http://localhost:8080/api/badges}")
    private String serveBaseUrl;

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

        if (req.getDisplayName() != null) def.setDisplayName(req.getDisplayName());
        if (req.getDescription()  != null) def.setDescription(req.getDescription());
        if (req.getRarity()       != null) def.setRarity(req.getRarity());
        if (req.getTargetPercentage() != null) def.setTargetPercentage(req.getTargetPercentage());
        if (req.getRuleType()     != null) def.setRuleType(req.getRuleType());
        if (req.getRuleThreshold() > 0)    def.setRuleThreshold(req.getRuleThreshold());

        return toResponse(badgeRepo.save(def), userRepo.count(), null, null);
    }

    // ── Admin: image upload ──────────────────────────────────────────────────

    @Override
    public BadgeDefinitionResponse uploadImage(String badgeKey, MultipartFile file) {
    BadgeDefinition def = badgeRepo.findByBadgeKey(badgeKey)
            .orElseThrow(() -> new RuntimeException("Badge not found: " + badgeKey));
    try {
        Path dir = Paths.get(uploadDir);
        Files.createDirectories(dir);
        String ext = getExtension(file.getOriginalFilename());
        String filename = badgeKey.toLowerCase() + "." + ext;
        Path target = dir.resolve(filename);
        Files.copy(file.getInputStream(), target,
                java.nio.file.StandardCopyOption.REPLACE_EXISTING);
        def.setImageFilePath(filename);
        badgeRepo.save(def);
    } catch (IOException e) {
        throw new RuntimeException("Failed to save badge image", e);
    }
    return toResponse(def, userRepo.count(), null, null);
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
                .map(def -> def.getImageFilePath() != null
                        ? serveBaseUrl + "/" + badgeKey + "/image"
                        : null)
                .orElse(null);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private BadgeDefinitionResponse toResponse(BadgeDefinition def, long totalUsers,
                                               Boolean earned, java.time.LocalDateTime earnedAt) {
        long unlockCount = achievementRepo.countByBadgeName(def.getBadgeKey());
        double unlockPct = totalUsers > 0 ? (unlockCount * 100.0 / totalUsers) : 0;

        String imageUrl = def.getImageFilePath() != null
                ? serveBaseUrl + "/" + def.getBadgeKey() + "/image"
                : null;

        return BadgeDefinitionResponse.builder()
                .id(def.getId())
                .badgeKey(def.getBadgeKey())
                .displayName(def.getDisplayName())
                .description(def.getDescription())
                .rarity(def.getRarity())
                .targetPercentage(def.getTargetPercentage())
                .imageUrl(imageUrl)
                .ruleType(def.getRuleType())
                .ruleThreshold(def.getRuleThreshold())
                .systemDefined(def.isSystemDefined())
                .unlockCount(unlockCount)
                .unlockPercentage(Math.round(unlockPct * 10.0) / 10.0)
                .earned(earned != null && earned)
                .earnedAt(earnedAt)
                .build();
    }

    private String getExtension(String filename) {
        if (filename == null) return "png";
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot + 1).toLowerCase() : "png";
    }
}
