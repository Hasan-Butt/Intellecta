package com.intellecta.intellecta_backend.controller;

import com.intellecta.intellecta_backend.dto.response.LeaderboardEntryDTO;
import com.intellecta.intellecta_backend.dto.response.PeerComparisonDTO;
import com.intellecta.intellecta_backend.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboards")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @GetMapping("/global/{userId}")
    public ResponseEntity<List<LeaderboardEntryDTO>> getGlobalLeaderboard(
            @PathVariable Long userId) {
        return ResponseEntity.ok(leaderboardService.getGlobalLeaderboard(userId));
    }

    @GetMapping("/sectional/{userId}")
    public ResponseEntity<List<LeaderboardEntryDTO>> getSectionalLeaderboard(
            @PathVariable Long userId,
            @RequestParam(required = false, defaultValue = "Computer Science") String category) {
        return ResponseEntity.ok(leaderboardService.getSectionalLeaderboard(userId, category));
    }

    @GetMapping("/compare/{userId}/{peerId}")
    public ResponseEntity<PeerComparisonDTO> comparePeers(
            @PathVariable Long userId,
            @PathVariable Long peerId) {
        return ResponseEntity.ok(leaderboardService.comparePeers(userId, peerId));
    }
}
