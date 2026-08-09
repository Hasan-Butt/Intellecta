package com.intellecta.intellecta_backend.controller;

import com.intellecta.intellecta_backend.dto.request.BadgeDefinitionRequest;
import com.intellecta.intellecta_backend.dto.response.BadgeDefinitionResponse;
import com.intellecta.intellecta_backend.service.BadgeDefinitionService;
import com.intellecta.intellecta_backend.service.GamificationService;
import com.intellecta.intellecta_backend.security.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class BadgeController {

    private final BadgeDefinitionService badgeService;
    private final GamificationService gamificationService;

    // ── Admin endpoints ───────────────────────────────────────────────────────

    @GetMapping("/api/admin/badges")
    public ResponseEntity<List<BadgeDefinitionResponse>> getAllBadges() {
        return ResponseEntity.ok(badgeService.getAllBadges());
    }

    @PostMapping("/api/admin/badges")
    public ResponseEntity<BadgeDefinitionResponse> createBadge(
            @Valid @RequestBody BadgeDefinitionRequest req) {
        return ResponseEntity.ok(badgeService.createBadge(req));
    }

    @PutMapping("/api/admin/badges/{badgeKey}")
    public ResponseEntity<BadgeDefinitionResponse> updateBadge(
            @PathVariable String badgeKey,
            @Valid @RequestBody BadgeDefinitionRequest req) {
        return ResponseEntity.ok(badgeService.updateBadge(badgeKey, req));
    }

    /**
     * Set badge image URL — accepts JSON with the UploadThing CDN URL.
     * Frontend uploads to UploadThing first, then POSTs the URL here.
     *
     * Body: { "imageUrl": "https://utfs.io/f/..." }
     */
    @PostMapping("/api/admin/badges/{badgeKey}/image")
    public ResponseEntity<BadgeDefinitionResponse> setImageUrl(
            @PathVariable String badgeKey,
            @RequestBody Map<String, String> body) {
        String imageUrl = body.get("imageUrl");
        return ResponseEntity.ok(badgeService.setImageUrl(badgeKey, imageUrl));
    }

    @DeleteMapping("/api/admin/badges/{badgeKey}")
    public ResponseEntity<Map<String, String>> deleteBadge(@PathVariable String badgeKey) {
        badgeService.deleteBadge(badgeKey);
        return ResponseEntity.ok(Map.of("message", "Badge deleted"));
    }

    // ── Student: all badges with earned status ────────────────────────────────

    @GetMapping("/api/achievements/user/{userId}/all")
    public ResponseEntity<List<BadgeDefinitionResponse>> getAllForStudent(
            @PathVariable Long userId) {
        SecurityUtils.validateUser(userId);
        gamificationService.checkAndAwardBadges(userId);
        return ResponseEntity.ok(badgeService.getAllBadgesForStudent(userId));
    }

    // ── Student: earned achievements only ────────────────────────────────────

    @GetMapping("/api/achievements/user/{userId}")
    public ResponseEntity<List<BadgeDefinitionResponse>> getEarned(
            @PathVariable Long userId) {
        SecurityUtils.validateUser(userId);
        List<BadgeDefinitionResponse> all = badgeService.getAllBadgesForStudent(userId);
        return ResponseEntity.ok(all.stream()
                .filter(BadgeDefinitionResponse::isEarned)
                .toList());
    }
}
