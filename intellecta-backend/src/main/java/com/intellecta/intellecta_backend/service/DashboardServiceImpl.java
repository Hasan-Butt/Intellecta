package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.dto.response.*;
import com.intellecta.intellecta_backend.enums.BadgeType;
import com.intellecta.intellecta_backend.model.*;
import com.intellecta.intellecta_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.*;
import java.time.format.TextStyle;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private static final double DAILY_GOAL_HOURS = 6.0;
    private static final long   XP_PER_LEVEL     = 500L;

    private final UserRepository         userRepository;
    private final StudySessionRepository sessionRepository;
    private final CourseRepository        courseRepository;
    private final NotesRepository         notesRepository;
    private final DocumentRepository      documentRepository;
    private final SubjectRepository       subjectRepository;
    private final AchievementRepository   achievementRepository;
    private final DistractionRepository   distractionRepository;

    @Override
    public DashboardResponse getDashboard(Long userId) {

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        // ── Time boundaries ───────────────────────────────────────────────────
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        LocalDateTime sevenDaysAgo = LocalDate.now().minusDays(6).atStartOfDay();

        // ── Study sessions ────────────────────────────────────────────────────
        List<StudySession> allSessions   = sessionRepository.findByUserIdOrderByStartTimeDesc(userId);
        List<StudySession> todaySessions = sessionRepository.findByUserIdAndStartTimeAfter(userId, startOfToday);

        double todayHours = todaySessions.stream()
            .mapToLong(StudySession::getDurationMinutes).sum() / 60.0;
        int dailyGoalPct = (int) Math.min(100, (todayHours / DAILY_GOAL_HOURS) * 100);

        int totalPomodoros = Optional.ofNullable(
        sessionRepository.sumPomodorosByUserId(userId)
        ).orElse(0);

        // ── XP / Level ────────────────────────────────────────────────────────
        long currentXp    = user.getXp();
        int  level        = user.getLevel();
        long nextLevelXp  = level * XP_PER_LEVEL;
        long prevLevelXp  = (level - 1) * XP_PER_LEVEL;
        int  xpPct        = (int) Math.min(100,
            ((currentXp - prevLevelXp) * 100.0) / (nextLevelXp - prevLevelXp));
        String levelTitle = resolveLevelTitle(level);

        // ── Recent badges ─────────────────────────────────────────────────────
        List<BadgeType> recentBadges = achievementRepository
            .findTop3ByUserIdOrderByEarnedAtDesc(userId)
            .stream().map(Achievement::getBadgeName)
            .collect(Collectors.toList());

        // ── Focus week chart ──────────────────────────────────────────────────
        List<FocusDayDTO> focusWeek = buildFocusWeek(userId, sevenDaysAgo);

        // ── Today's schedule (upcoming courses as blocks) ─────────────────────
        List<ScheduleBlockDTO> todaySchedule = buildTodaySchedule(userId);

        // ── Review queue ──────────────────────────────────────────────────────
        List<ReviewItemDTO> reviewQueue = notesRepository
            .findByUserIdAndFlaggedForReviewTrue(userId)
            .stream().limit(5).map(n -> ReviewItemDTO.builder()
                .id(n.getId())
                .title(n.getTitle())
                .subtitle(n.getUpdatedAt() != null
                    ? formatTimeAgo(n.getUpdatedAt()) : "")
                .urgent(ChronoUnit.DAYS.between(n.getUpdatedAt(), LocalDateTime.now()) >= 2)
                .build())
            .collect(Collectors.toList());

        // ── Distraction summary ───────────────────────────────────────────────
        DistractionSummaryDTO distractionSummary = buildDistractionSummary(userId, sevenDaysAgo);

        // ── Leaderboard ───────────────────────────────────────────────────────
        List<LeaderboardEntryDTO> leaderboard = buildLeaderboard(userId, allSessions);

        // ── Quick counts ──────────────────────────────────────────────────────
        long noteCount    = notesRepository.countByUserId(userId);
        long reviewCount  = notesRepository.countByUserIdAndFlaggedForReviewTrue(userId);
        long docCount     = documentRepository.countByUserId(userId);
        long subjectCount = subjectRepository.countByUserId(userId);

        return DashboardResponse.builder()
            .username(user.getUsername() == null ? "" : 
            Character.toUpperCase(user.getUsername().charAt(0)) + 
            user.getUsername().substring(1))
            .todayStudyHours(Math.round(todayHours * 10.0) / 10.0)
            .dailyGoalHours(DAILY_GOAL_HOURS)
            .dailyGoalPct(dailyGoalPct)
            .streakDays(user.getStreakDays())
            .level(level)
            .currentXp(currentXp)
            .nextLevelXp(nextLevelXp)
            .xpProgressPct(xpPct)
            .levelTitle(levelTitle)
            .totalNotes(noteCount)
            .reviewQueueCount(reviewCount)
            .totalDocuments(docCount)
            .totalSubjects(subjectCount)
            .totalSessions(allSessions.size())
            .totalPomodoros(totalPomodoros)
            .recentBadges(recentBadges)
            .focusWeek(focusWeek)
            .todaySchedule(todaySchedule)
            .reviewQueue(reviewQueue)
            .distractionSummary(distractionSummary)
            .leaderboard(leaderboard)
            .build();
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private List<FocusDayDTO> buildFocusWeek(Long userId, LocalDateTime from) {
        // Build a map of date → minutes from DB
        List<Object[]> rows = sessionRepository.dailyFocusMinutes(userId, from);
        Map<LocalDate, Long> minuteMap = new LinkedHashMap<>();
        for (Object[] row : rows) {
            LocalDate date = ((java.sql.Date) row[0]).toLocalDate();
            minuteMap.put(date, ((Number) row[1]).longValue());
        }

        // Distraction dates
        List<DistractionEntry> recentDistractions =
            distractionRepository.findByUserIdAndLoggedAtAfterOrderByLoggedAtDesc(
                userId, from);
        Set<LocalDate> distractionDates = recentDistractions.stream()
            .map(d -> d.getLoggedAt().toLocalDate())
            .collect(Collectors.toSet());

        // Build 7-day list starting from 6 days ago
        List<FocusDayDTO> result = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            String label = date.getDayOfWeek()
                .getDisplayName(TextStyle.SHORT, Locale.ENGLISH)
                .substring(0, 3); // "Mon", "Tue"…
            result.add(FocusDayDTO.builder()
                .dayLabel(label)
                .focusMinutes(minuteMap.getOrDefault(date, 0L))
                .hadDistraction(distractionDates.contains(date))
                .build());
        }
        return result;
    }

    private List<ScheduleBlockDTO> buildTodaySchedule(Long userId) {
        // Show upcoming exams as schedule blocks (nearest 3)
        List<Course> upcoming = courseRepository
            .findByUserIdAndExamDateAfterOrderByExamDateAsc(userId, LocalDate.now());

        String[] colors = { "#6bfe9c", "#e6deff", "#ffdfa0" };
        List<ScheduleBlockDTO> blocks = new ArrayList<>();
        for (int i = 0; i < upcoming.size(); i++) {
        Course c = upcoming.get(i);
            long daysLeft = ChronoUnit.DAYS.between(LocalDate.now(), c.getExamDate());
            blocks.add(ScheduleBlockDTO.builder()
                .id(c.getId())
                .subject(c.getCourseName())
                .topic("Exam in " + daysLeft + " day" + (daysLeft == 1 ? "" : "s"))
                .color(colors[i % colors.length])
                .badge(daysLeft <= 3 ? "Urgent" : null)
                .duration(daysLeft > 3 ? c.getExamDate().toString() : null)
                .build());
        }
        return blocks;
    }

    private DistractionSummaryDTO buildDistractionSummary(Long userId, LocalDateTime from) {
        DistractionEntry latest =
            distractionRepository.findTopByUserIdOrderByLoggedAtDesc(userId);

        String recentReason  = latest != null ? latest.getReason() : "None logged";
        String recentTimeAgo = latest != null ? formatTimeAgo(latest.getLoggedAt()) : "";

        // Per-day counts for mini chart
        List<Object[]> rows = distractionRepository.dailyDistractionCounts(userId, from);
        Map<LocalDate, Long> countMap = new LinkedHashMap<>();
        for (Object[] row : rows) {
            LocalDate d = ((java.sql.Date) row[0]).toLocalDate();
            countMap.put(d, ((Number) row[1]).longValue());
        }
        List<Long> dailyCounts = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            dailyCounts.add(countMap.getOrDefault(LocalDate.now().minusDays(i), 0L));
        }

        return DistractionSummaryDTO.builder()
            .mostRecentReason(recentReason)
            .mostRecentTimeAgo(recentTimeAgo)
            .dailyCounts(dailyCounts)
            .build();
    }

    private List<LeaderboardEntryDTO> buildLeaderboard(Long userId,
                                                        List<StudySession> mySessions) {
        // Fetch all users, rank by XP descending
        List<User> allUsers = userRepository.findAll();
        allUsers.sort(Comparator.comparingLong(User::getXp).reversed());

        List<LeaderboardEntryDTO> board = new ArrayList<>();
        int rank = 1;
        for (User u : allUsers) {
            long focusHours = sessionRepository
                .findByUserIdOrderByStartTimeDesc(u.getId())
                .stream().mapToLong(StudySession::getDurationMinutes).sum() / 60;

            board.add(LeaderboardEntryDTO.builder()
                .rank(rank)
                .userId(u.getId())
                .username(u.getUsername())
                .focusHours(focusHours)
                .xp(u.getXp())
                .isCurrentUser(u.getId().equals(userId))
                .build());
            rank++;
        }
        return board.stream().limit(5).collect(Collectors.toList());
    }

    private String resolveLevelTitle(int level) {
        if (level <= 3)  return "Beginner";
        if (level <= 6)  return "Apprentice";
        if (level <= 10) return "Scholar";
        if (level <= 15) return "Expert";
        return "Master";
    }

    private String formatTimeAgo(LocalDateTime time) {
        long minutes = ChronoUnit.MINUTES.between(time, LocalDateTime.now());
        if (minutes < 60)   return minutes + "m ago";
        long hours = minutes / 60;
        if (hours < 24)     return hours + "h ago";
        return (hours / 24) + "d ago";
    }
}