package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.dto.response.LeaderboardEntryDTO;
import com.intellecta.intellecta_backend.dto.response.PeerComparisonDTO;
import java.util.List;

public interface LeaderboardService {
    List<LeaderboardEntryDTO> getGlobalLeaderboard(Long userId);
    List<LeaderboardEntryDTO> getSectionalLeaderboard(Long userId, String category);
    List<String> getSectionalCategories();
    PeerComparisonDTO comparePeers(Long userId, Long peerId);
}
