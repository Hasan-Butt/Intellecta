package com.intellecta.intellecta_backend.util;

/**
 * Single source of truth for the XP → level curve.
 * Level N requires 100 * N^1.5 total XP.
 * Keeps User, LeaderboardServiceImpl and DashboardServiceImpl from drifting.
 */
public final class LevelUtils {

    private LevelUtils() {
    }

    public static int calculateLevel(long totalXp) {
        int lvl = 1;
        while (100.0 * Math.pow(lvl + 1, 1.5) <= totalXp) {
            lvl++;
        }
        return lvl;
    }

    public static long nextLevelXp(int level) {
        return (long) (100.0 * Math.pow(level + 1, 1.5));
    }

    public static long prevLevelXp(int level) {
        return level <= 1 ? 0L : (long) (100.0 * Math.pow(level, 1.5));
    }

    public static int xpProgressPct(long xp, int level) {
        return (int) Math.min(100,
            ((xp - prevLevelXp(level)) * 100.0) / Math.max(1, nextLevelXp(level) - prevLevelXp(level)));
    }
}
