package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.dto.response.LeaderboardEntryDTO;
import java.util.List;

public interface LeaderboardService {
    List<LeaderboardEntryDTO> getGlobalLeaderboard(Long userId);
    List<LeaderboardEntryDTO> getSectionalLeaderboard(Long userId, String category);
}
