package com.intellecta.intellecta_backend.controller;

import com.intellecta.intellecta_backend.dto.response.LeaderboardEntryDTO;
import com.intellecta.intellecta_backend.dto.response.PeerComparisonDTO;
import com.intellecta.intellecta_backend.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.intellecta.intellecta_backend.security.SecurityUtils;

@RestController
@RequestMapping("/api/leaderboards")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @GetMapping("/global/{userId}")
    public ResponseEntity<List<LeaderboardEntryDTO>> getGlobalLeaderboard(
            @PathVariable Long userId) {
        SecurityUtils.validateUser(userId);
        return ResponseEntity.ok(leaderboardService.getGlobalLeaderboard(userId));
    }

    @GetMapping("/sectional/categories")
    public ResponseEntity<List<String>> getSectionalCategories() {
        return ResponseEntity.ok(leaderboardService.getSectionalCategories());
    }

    @GetMapping("/sectional/{userId}")
    public ResponseEntity<List<LeaderboardEntryDTO>> getSectionalLeaderboard(
            @PathVariable Long userId,
            @RequestParam(required = false, defaultValue = "Computer Science") String category) {
        SecurityUtils.validateUser(userId);
        return ResponseEntity.ok(leaderboardService.getSectionalLeaderboard(userId, category));
    }

    @GetMapping("/compare/{userId}/{peerId}")
    public ResponseEntity<PeerComparisonDTO> comparePeers(
            @PathVariable Long userId,
            @PathVariable Long peerId) {
        SecurityUtils.validateUser(userId);
        return ResponseEntity.ok(leaderboardService.comparePeers(userId, peerId));
    }
}
