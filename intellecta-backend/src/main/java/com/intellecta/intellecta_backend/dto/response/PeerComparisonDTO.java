package com.intellecta.intellecta_backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class PeerComparisonDTO {

    private PeerStatsDTO me;
    private PeerStatsDTO peer;

    @Data
    @Builder
    public static class PeerStatsDTO {
        private Long   userId;
        private String username;
        private int    globalRank;
        private long   xp;
        private int    level;
        private String levelTitle;
        private int    xpProgressPct;
        private long   focusHours;
        private long   totalSessions;
        private int    totalPomodoros;
        private int    streakDays;
        private long   totalNotes;
        private long   totalDocuments;
        // category → sectional XP
        private Map<String, Long> sectionalXp;
        // 14-day heatmap intensity (0-4)
        private List<Integer> heatmap;
    }
}
