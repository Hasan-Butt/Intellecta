// Single source of truth for the XP → level curve on the frontend.
// Mirrors backend com.intellecta.intellecta_backend.util.LevelUtils:
// level N requires 100 * N^1.5 total XP.

export const calculateLevel = (xp) => {
  let lvl = 1;
  while (100.0 * Math.pow(lvl + 1, 1.5) <= xp) lvl++;
  return lvl;
};

export const nextLevelXp = (level) => Math.floor(100.0 * Math.pow(level + 1, 1.5));

export const prevLevelXp = (level) => (level <= 1 ? 0 : Math.floor(100.0 * Math.pow(level, 1.5)));

export const xpProgressPct = (xp, level) =>
  Math.min(100, Math.floor(((xp - prevLevelXp(level)) * 100) / Math.max(1, nextLevelXp(level) - prevLevelXp(level))));
