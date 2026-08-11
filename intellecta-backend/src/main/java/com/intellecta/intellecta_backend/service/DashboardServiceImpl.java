package com.intellecta.intellecta_backend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.intellecta.intellecta_backend.dto.response.DashboardResponse;
import com.intellecta.intellecta_backend.dto.response.DistractionSummaryDTO;
import com.intellecta.intellecta_backend.dto.response.FocusDayDTO;
import com.intellecta.intellecta_backend.dto.response.LeaderboardEntryDTO;
import com.intellecta.intellecta_backend.dto.response.ReviewItemDTO;
import com.intellecta.intellecta_backend.dto.response.ScheduleBlockDTO;
import com.intellecta.intellecta_backend.model.Achievement;
import com.intellecta.intellecta_backend.model.Course;
import com.intellecta.intellecta_backend.model.DistractionEntry;
import com.intellecta.intellecta_backend.model.StudySession;
import com.intellecta.intellecta_backend.model.User;
import com.intellecta.intellecta_backend.repository.AchievementRepository;
import com.intellecta.intellecta_backend.repository.CourseRepository;
import com.intellecta.intellecta_backend.repository.DistractionRepository;
import com.intellecta.intellecta_backend.repository.DocumentRepository;
import com.intellecta.intellecta_backend.repository.NotesRepository;
import com.intellecta.intellecta_backend.repository.StudySessionRepository;
import com.intellecta.intellecta_backend.repository.SubjectRepository;
import com.intellecta.intellecta_backend.repository.UserRepository;
import com.intellecta.intellecta_backend.util.LevelUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository         userRepository;
    private final StudySessionRepository sessionRepository;
    private final CourseRepository        courseRepository;
    private final NotesRepository         notesRepository;
    private final DocumentRepository      documentRepository;
    private final SubjectRepository       subjectRepository;
    private final AchievementRepository   achievementRepository;
    private final DistractionRepository   distractionRepository;
    private final GamificationService     gamificationService;
    private final com.intellecta.intellecta_backend.repository.BadgeDefinitionRepository badgeDefinitionRepository;

    @org.springframework.beans.factory.annotation.Value("${badge.serve.base-url:http://localhost:8080/api/badges}")
    private String serveBaseUrl;

    @Override
    public DashboardResponse getDashboard(Long userId) {
        // Sync achievements before building dashboard
        gamificationService.checkAndAwardBadges(userId);

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        // ── Check/Reset Streak ──
        if (user.getStreakDays() > 0 && user.getLastStudyDate() != null) {
            LocalDate today = LocalDate.now();
            if (user.getLastStudyDate().isBefore(today.minusDays(1))) {
                user.setStreakDays(0);
                userRepository.save(user);
            }
        }

        // ── Time boundaries ───────────────────────────────────────────────────
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        LocalDateTime sevenDaysAgo = LocalDate.now().minusDays(6).atStartOfDay();

        // ── Study sessions ────────────────────────────────────────────────────
        List<StudySession> allSessions   = sessionRepository.findByUserIdOrderByStartTimeDesc(userId);
        List<StudySession> todaySessions = sessionRepository.findByUserIdAndStartTimeAfter(userId, startOfToday);

        double todayHours = todaySessions.stream()
            .mapToLong(StudySession::getDurationMinutes).sum() / 60.0;
        
        double dailyGoal = user.getDailyGoalHours() > 0 ? user.getDailyGoalHours() : 6.0;
        int dailyGoalPct = (int) Math.min(100, (todayHours / dailyGoal) * 100);

        int totalPomodoros = Optional.ofNullable(
        sessionRepository.sumPomodorosByUserId(userId)
        ).orElse(0);

        // ── XP / Level ────────────────────────────────────────────────────────
        long currentXp    = user.getXp();
        int  level        = LevelUtils.calculateLevel(currentXp);
        long nextLevelXp  = LevelUtils.nextLevelXp(level);
        long prevLevelXp  = LevelUtils.prevLevelXp(level);
        int  xpPct        = LevelUtils.xpProgressPct(currentXp, level);
        String levelTitle = resolveLevelTitle(level);

        // ── Recent badges ─────────────────────────────────────────────────────
        List<DashboardResponse.BadgeDTO> recentBadges = achievementRepository
            .findTop3ByUserIdOrderByEarnedAtDesc(userId)
            .stream().map(a -> {
                String key = a.getBadgeName();
                String imageUrl = badgeDefinitionRepository.findByBadgeKey(key)
                        .map(def -> def.getImageUrl())
                        .orElse(null);
                return DashboardResponse.BadgeDTO.builder()
                        .key(key)
                        .imageUrl(imageUrl)
                        .build();
            })
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
                .content(n.getContent())
                .subtitle(n.getUpdatedAt() != null
                    ? formatTimeAgo(n.getUpdatedAt()) : "")
                .urgent(ChronoUnit.DAYS.between(n.getUpdatedAt(), LocalDateTime.now()) >= 2)
                .build())
            .collect(Collectors.toList());

        // ── Distraction summary ───────────────────────────────────────────────
        DistractionSummaryDTO distractionSummary = buildDistractionSummary(userId, sevenDaysAgo);

        // ── Leaderboard ───────────────────────────────────────────────────────
        List<User> allUsers = userRepository.findAll();
        allUsers.sort(Comparator.comparingLong(User::getXp).reversed());

        List<LeaderboardEntryDTO> leaderboard = new ArrayList<>();
        int currentUserRank = 1;
        int currentRank = 1;
        int displayRank = 1;
        long prevXp = -1;

        for (User u : allUsers) {
            if (u.getXp() != prevXp) {
                displayRank = currentRank;
                prevXp = u.getXp();
            }
            if (u.getId().equals(userId)) {
                currentUserRank = displayRank;
            }

            if (leaderboard.size() < 5) {
                long focusHours = sessionRepository
                    .findByUserIdOrderByStartTimeDesc(u.getId())
                    .stream().mapToLong(StudySession::getDurationMinutes).sum() / 60;

                int uLevel = LevelUtils.calculateLevel(u.getXp());
                long uNextLevelXp = LevelUtils.nextLevelXp(uLevel);
                long uPrevLevelXp = LevelUtils.prevLevelXp(uLevel);
                int uXpPct = LevelUtils.xpProgressPct(u.getXp(), uLevel);

                leaderboard.add(LeaderboardEntryDTO.builder()
                    .rank(displayRank)
                    .userId(u.getId())
                    .username(u.getUsername())
                    .focusHours(focusHours)
                    .xp(u.getXp())
                    .level(uLevel)
                    .xpProgressPct(uXpPct)
                    .discipline("General")
                    .avatarUrl(u.getAvatarUrl())
                    .isCurrentUser(u.getId().equals(userId))
                    .build());
            }
            currentRank++;
        }

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
            .streakDays(user.getStreakDays())
            .totalNotes(noteCount)
            .reviewQueueCount(reviewCount)
            .totalDocuments(docCount)
            .totalSubjects(subjectCount)
            .totalSessions(allSessions.size())
            .totalPomodoros(totalPomodoros)
            .dailyGoalHours(dailyGoal)
            .dailyGoalPct(dailyGoalPct)
            .level(level)
            .currentXp(currentXp)
            .nextLevelXp(nextLevelXp)
            .xpProgressPct(xpPct)
            .levelTitle(levelTitle)
            .recentBadges(recentBadges)
            .focusWeek(focusWeek)
            .todaySchedule(todaySchedule)
            .reviewQueue(reviewQueue)
            .distractionSummary(distractionSummary)
            .leaderboard(leaderboard)
            .currentUserRank(currentUserRank)
            .subjectFocus(buildSubjectFocus(allSessions))
            .build();
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private List<FocusDayDTO> buildFocusWeek(Long userId, LocalDateTime from) {
        // Build a map of date → minutes from DB
        List<Object[]> rows = sessionRepository.dailyFocusMinutes(userId, from);
        Map<LocalDate, Long> minuteMap = new LinkedHashMap<>();
       for (Object[] row : rows) {
        LocalDate date;
        if (row[0] instanceof java.sql.Date) {
            date = ((java.sql.Date) row[0]).toLocalDate();
        } else {
            date = (LocalDate) row[0];
        }
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
           blocks.add(ScheduleBlockDTO.builder()  // was ScheduleBlockResponse.builder()
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
            LocalDate d = (row[0] instanceof java.sql.Date)
            ? ((java.sql.Date) row[0]).toLocalDate()
            : (LocalDate) row[0];
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

    private List<DashboardResponse.SubjectFocusDTO> buildSubjectFocus(List<StudySession> sessions) {
        if (sessions.isEmpty()) return new ArrayList<>();

        Map<String, Long> subjectMinutes = sessions.stream()
            .filter(s -> s.getEndTime() != null)
            .collect(Collectors.groupingBy(
                StudySession::getSubject,
                Collectors.summingLong(s -> ChronoUnit.MINUTES.between(s.getStartTime(), s.getEndTime()))
            ));

        long totalMinutes = subjectMinutes.values().stream().mapToLong(Long::longValue).sum();
        if (totalMinutes == 0) return new ArrayList<>();

        String[] colors = { "#5D5FEF", "#A5A6F6", "#E2E2F2", "#6bfe9c", "#ffdfa0" };
        int colorIdx = 0;

        List<DashboardResponse.SubjectFocusDTO> result = new ArrayList<>();
        for (Map.Entry<String, Long> entry : subjectMinutes.entrySet()) {
            double hours = Math.round((entry.getValue() / 60.0) * 10.0) / 10.0;
            int pct = (int) ((entry.getValue() * 100) / totalMinutes);
            result.add(DashboardResponse.SubjectFocusDTO.builder()
                .subject(entry.getKey())
                .hours(hours)
                .percentage(pct)
                .color(colors[colorIdx % colors.length])
                .build());
            colorIdx++;
        }
        return result.stream()
            .sorted((a, b) -> Integer.compare(b.getPercentage(), a.getPercentage()))
            .limit(5)
            .collect(Collectors.toList());
    }

    @Override
    public void updateDailyGoal(Long userId, double hours) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        user.setDailyGoalHours(hours);
        userRepository.save(user);
    }
}
