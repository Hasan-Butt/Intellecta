package com.intellecta.intellecta_backend.dto.response;

import java.util.List;

import com.intellecta.intellecta_backend.enums.BadgeType;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class DashboardResponse {

    // Greeting
    private String username;

    // Daily goal card  (matches "4.2 / 6 hrs" widget)
    private double todayStudyHours;
    private double dailyGoalHours;      // fixed at 6.0 for now
    private int    dailyGoalPct;        // 0-100

    // Streak card
    private int streakDays;

    // XP / Level panel
    private int    level;
    private long   currentXp;
    private long   nextLevelXp;
    private int    xpProgressPct;       // 0-100
    private String levelTitle;          // e.g. "Scholar"

    // Quick counts
    private long totalNotes;
    private long reviewQueueCount;
    private long totalDocuments;
    private long totalSubjects;
    private long totalSessions;
    private int  totalPomodoros;

    // Recent achievements (up to 3 badge names)
    private List<BadgeType> recentBadges;

    // Focus chart — 7 entries Mon→Sun
    private List<FocusDayDTO> focusWeek;

    // Today's schedule blocks
    private List<ScheduleBlockDTO> todaySchedule;

    // Review queue items
    private List<ReviewItemDTO> reviewQueue;

    // Distraction log
    private DistractionSummaryDTO distractionSummary;

    // Leaderboard top 5
    private List<LeaderboardEntryDTO> leaderboard;
    private int currentUserRank;
}