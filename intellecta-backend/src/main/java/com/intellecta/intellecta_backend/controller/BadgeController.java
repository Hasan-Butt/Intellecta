package com.intellecta.intellecta_backend.controller;

import com.intellecta.intellecta_backend.dto.request.BadgeDefinitionRequest;
import com.intellecta.intellecta_backend.dto.response.BadgeDefinitionResponse;
import com.intellecta.intellecta_backend.model.BadgeDefinition;
import com.intellecta.intellecta_backend.repository.BadgeDefinitionRepository;
import com.intellecta.intellecta_backend.service.BadgeDefinitionService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class BadgeController {

    private final BadgeDefinitionService badgeService;
    private final BadgeDefinitionRepository badgeRepo;

    @Value("${badge.upload.dir:uploads/badges}")
    private String uploadDir;

    // ── Admin endpoints ───────────────────────────────────────────────────────

    @GetMapping("/api/admin/badges")
    public ResponseEntity<List<BadgeDefinitionResponse>> getAllBadges() {
        return ResponseEntity.ok(badgeService.getAllBadges());
    }

    @PostMapping("/api/admin/badges")
    public ResponseEntity<BadgeDefinitionResponse> createBadge(
            @RequestBody BadgeDefinitionRequest req) {
        return ResponseEntity.ok(badgeService.createBadge(req));
    }

    @PutMapping("/api/admin/badges/{badgeKey}")
    public ResponseEntity<BadgeDefinitionResponse> updateBadge(
            @PathVariable String badgeKey,
            @RequestBody BadgeDefinitionRequest req) {
        return ResponseEntity.ok(badgeService.updateBadge(badgeKey, req));
    }

    @PostMapping("/api/admin/badges/{badgeKey}/image")
    public ResponseEntity<BadgeDefinitionResponse> uploadImage(
            @PathVariable String badgeKey,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(badgeService.uploadImage(badgeKey, file));
    }

    @DeleteMapping("/api/admin/badges/{badgeKey}")
    public ResponseEntity<Map<String, String>> deleteBadge(@PathVariable String badgeKey) {
        badgeService.deleteBadge(badgeKey);
        return ResponseEntity.ok(Map.of("message", "Badge deleted"));
    }

    // ── Public: serve badge image ─────────────────────────────────────────────

    @GetMapping("/api/badges/{badgeKey}/image")
    public ResponseEntity<Resource> getBadgeImage(@PathVariable String badgeKey) {
        BadgeDefinition def = badgeRepo.findByBadgeKey(badgeKey).orElse(null);
        if (def == null || def.getImageFilePath() == null) {
            return ResponseEntity.notFound().build();
        }
        Path filePath = Paths.get(uploadDir).resolve(def.getImageFilePath());
        Resource resource = new FileSystemResource(filePath);
        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }
        String contentType = def.getImageFilePath().endsWith(".svg")
                ? "image/svg+xml" : "image/png";
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }

    // ── Student: all badges with earned status ────────────────────────────────

    @GetMapping("/api/achievements/user/{userId}/all")
    public ResponseEntity<List<BadgeDefinitionResponse>> getAllForStudent(
            @PathVariable Long userId) {
        return ResponseEntity.ok(badgeService.getAllBadgesForStudent(userId));
    }

    // ── Student: earned achievements only ────────────────────────────────────

    @GetMapping("/api/achievements/user/{userId}")
    public ResponseEntity<List<BadgeDefinitionResponse>> getEarned(
            @PathVariable Long userId) {
        List<BadgeDefinitionResponse> all = badgeService.getAllBadgesForStudent(userId);
        return ResponseEntity.ok(all.stream()
                .filter(BadgeDefinitionResponse::isEarned)
                .toList());
    }
}
