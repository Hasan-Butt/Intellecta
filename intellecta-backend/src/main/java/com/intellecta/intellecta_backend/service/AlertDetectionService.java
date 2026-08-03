package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.event.UserLoginEvent;
import com.intellecta.intellecta_backend.model.QuizAttempt;
import com.intellecta.intellecta_backend.model.StudySession;
import com.intellecta.intellecta_backend.model.SystemAlert;
import com.intellecta.intellecta_backend.repository.QuizAttemptRepository;
import com.intellecta.intellecta_backend.repository.StudySessionRepository;
import com.intellecta.intellecta_backend.repository.SystemAlertRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlertDetectionService {

    private final SystemAlertRepository alertRepository;
    private final StudySessionRepository studySessionRepository;
    private final QuizAttemptRepository quizAttemptRepository;

    @Value("${app.storage.upload-path:uploads}")
    private String uploadPath;

    @Value("${app.storage.max-bytes:1073741824}")
    private long storageMaxBytes;

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");

    // ── Alert 1 — Unusual login (off-hours: 00:00–05:00) ─────────────────────
    // Runs synchronously per login, in its own transaction so it can write
    // without being constrained by AuthServiceImpl's readOnly transaction.

    @EventListener
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onUserLogin(UserLoginEvent event) {
        int hour = event.getLoginTime().getHour();
        if (hour >= 5) return; // not off-hours

        String key = "LOGIN_ANOMALY:" + event.getUser().getEmail();
        // Dedup: suppress if an active alert for this user was created in the last 6 hours
        if (alertRepository.existsByAlertKeyAndResolvedFalseAndAlertTimeAfter(
                key, LocalDateTime.now().minusHours(6))) {
            return;
        }

        String username = event.getUser().getUsername();
        String timeStr  = event.getLoginTime().format(TIME_FMT);

        alertRepository.save(SystemAlert.builder()
                .title("Unusual login pattern detected for user " + username)
                .description("Unusual login pattern detected for user " + username
                        + " — login at " + timeStr + " (off-hours).")
                .alertTime(LocalDateTime.now())
                .alertType("WARNING")
                .iconType("ANOMALY")
                .alertKey(key)
                .resolved(false)
                .build());
    }

    // ── Alert 2 — Concurrent sessions spike (every 10 minutes) ───────────────

    @Scheduled(fixedRate = 600_000)
    @Transactional
    public void checkConcurrentSessionsSpike() {
        long current = studySessionRepository.findAll().stream()
                .filter(s -> s.getEndTime() == null)
                .count();

        double baseline = computeWeeklyBaselineConcurrency();
        double threshold = Math.max(baseline * 1.5, 5.0);

        String key = "CONCURRENT_SESSIONS_SPIKE";
        Optional<SystemAlert> existing = alertRepository.findFirstByAlertKeyAndResolvedFalse(key);

        if (current > threshold) {
            if (existing.isEmpty()) {
                long pct = baseline > 0
                        ? Math.round((current - baseline) * 100.0 / baseline)
                        : 100L;
                alertRepository.save(SystemAlert.builder()
                        .title("Peak concurrent sessions hit " + current
                                + " — " + pct + "% above weekly average")
                        .description("Peak concurrent sessions hit " + current
                                + " — " + pct + "% above weekly average.")
                        .alertTime(LocalDateTime.now())
                        .alertType("WARNING")
                        .iconType("PERFORMANCE")
                        .alertKey(key)
                        .resolved(false)
                        .build());
            }
            // Existing alert already active — no duplicate needed
        } else if (current <= baseline * 1.2) {
            // Condition cleared — auto-resolve
            existing.ifPresent(a -> {
                a.setAlertType("RESOLVED");
                a.setResolved(true);
                alertRepository.save(a);
            });
        }
    }

    // Baseline: average sessions-per-hour derived from the last 7 days of completed sessions.
    // Simple, robust, avoids scanning every minute-slot for all sessions.
    private double computeWeeklyBaselineConcurrency() {
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        long sessionsLastWeek = studySessionRepository.findAll().stream()
                .filter(s -> s.getStartTime() != null
                        && !s.getStartTime().isBefore(weekAgo)
                        && s.getEndTime() != null)
                .count();
        // Divide by 7 days × 12 active hours = avg sessions-per-hour as concurrent proxy
        return sessionsLastWeek / 84.0;
    }

    // ── Alert 3 — Quiz failure rate by category (every 6 hours) ──────────────

    @Scheduled(cron = "0 0 */6 * * *")
    @Transactional
    public void checkQuizFailureRates() {
        LocalDateTime since = LocalDateTime.now().minusDays(30);

        List<QuizAttempt> recent = quizAttemptRepository.findAll().stream()
                .filter(a -> a.getStartTime() != null
                        && !a.getStartTime().isBefore(since)
                        && a.getScore() != null
                        && a.getTotalQuestions() != null
                        && a.getTotalQuestions() > 0)
                .collect(Collectors.toList());

        // Group by quiz category (fall back to topic, then "General")
        Map<String, List<QuizAttempt>> byCategory = recent.stream()
                .collect(Collectors.groupingBy(a -> resolveCategory(a)));

        // Auto-resolve active failure alerts for categories now below the clearing threshold (60%)
        List<SystemAlert> activeFailureAlerts =
                alertRepository.findByAlertKeyStartingWithAndResolvedFalse("QUIZ_FAILURE:");
        for (SystemAlert active : activeFailureAlerts) {
            String category = active.getAlertKey().substring("QUIZ_FAILURE:".length());
            List<QuizAttempt> catAttempts = byCategory.getOrDefault(category, List.of());
            boolean shouldResolve = catAttempts.size() < 10
                    || failureRate(catAttempts) < 60.0;
            if (shouldResolve) {
                active.setAlertType("RESOLVED");
                active.setResolved(true);
                alertRepository.save(active);
            }
        }

        // Evaluate each category and raise alert if threshold exceeded
        for (Map.Entry<String, List<QuizAttempt>> entry : byCategory.entrySet()) {
            String category = entry.getKey();
            List<QuizAttempt> attempts = entry.getValue();
            if (attempts.size() < 10) continue; // insufficient sample

            double rate = Math.round(failureRate(attempts) * 10) / 10.0;
            if (rate < 70.0) continue;

            String key = "QUIZ_FAILURE:" + category;
            if (alertRepository.findFirstByAlertKeyAndResolvedFalse(key).isEmpty()) {
                alertRepository.save(SystemAlert.builder()
                        .title("Quiz failure rate for " + category + " exceeded 70% threshold")
                        .description("Quiz failure rate for " + category + " exceeded 70% threshold ("
                                + rate + "% of " + attempts.size()
                                + " attempts in the last 30 days).")
                        .alertTime(LocalDateTime.now())
                        .alertType("WARNING")
                        .iconType("PERFORMANCE")
                        .alertKey(key)
                        .resolved(false)
                        .build());
            }
        }
    }

    private String resolveCategory(QuizAttempt a) {
        try {
            if (a.getQuiz() != null) {
                String cat   = a.getQuiz().getCategory();
                String topic = a.getQuiz().getTopic();
                if (cat   != null && !cat.isBlank())   return cat;
                if (topic != null && !topic.isBlank()) return topic;
            }
        } catch (Exception ignored) {}
        return "General";
    }

    private double failureRate(List<QuizAttempt> attempts) {
        long failures = attempts.stream()
                .filter(a -> (double) a.getScore() / a.getTotalQuestions() < 0.60)
                .count();
        return failures * 100.0 / attempts.size();
    }

    // ── Alert 4 — Excessive study hours (every hour at :00) ──────────────────

    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void checkExcessiveStudyHours() {
        String key = "EXCESSIVE_STUDY_HOURS";
        // Dedup: one alert per 23-hour window to avoid repeated firing while condition persists
        if (alertRepository.existsByAlertKeyAndResolvedFalseAndAlertTimeAfter(
                key, LocalDateTime.now().minusHours(23))) {
            return;
        }

        LocalDateTime since = LocalDateTime.now().minusHours(24);
        List<StudySession> completedRecent = studySessionRepository.findAll().stream()
                .filter(s -> s.getStartTime() != null
                        && !s.getStartTime().isBefore(since)
                        && s.getEndTime() != null)
                .collect(Collectors.toList());

        // Sum duration per user, flag those at or over 720 minutes (12 hours)
        Map<Long, Long> minutesByUser = completedRecent.stream()
                .collect(Collectors.groupingBy(
                        s -> s.getUser().getId(),
                        Collectors.summingLong(s ->
                                Duration.between(s.getStartTime(), s.getEndTime()).toMinutes())));

        long flaggedCount = minutesByUser.values().stream()
                .filter(mins -> mins >= 720)
                .count();

        if (flaggedCount == 0) return;

        String plural = flaggedCount > 1 ? "s" : "";
        alertRepository.save(SystemAlert.builder()
                .title(flaggedCount + " student" + plural
                        + " flagged for 12+ consecutive study hours")
                .description(flaggedCount + " student" + plural
                        + " flagged for 12+ consecutive study hours in the last 24 hours.")
                .alertTime(LocalDateTime.now())
                .alertType("WARNING")
                .iconType("ANOMALY")
                .alertKey(key)
                .resolved(false)
                .build());
    }

    // ── Alert 5 — Storage utilization (every hour at :30) ────────────────────
    // Offset by 30 minutes from Alert 4 to stagger DB load.

    @Scheduled(cron = "0 30 * * * *")
    @Transactional
    public void checkStorageUtilization() {
        long usedBytes  = computeUploadFolderSize();
        File uploadDir  = new File(uploadPath);
        long totalDisk  = uploadDir.getTotalSpace();
        long freeDisk   = uploadDir.getFreeSpace();

        double folderPct   = storageMaxBytes > 0 ? (usedBytes * 100.0 / storageMaxBytes) : 0.0;
        double diskFreePct = totalDisk > 0 ? (freeDisk * 100.0 / totalDisk) : 100.0;

        // Determine severity: CRITICAL at ≥90% folder or <5% disk free; WARNING at ≥80% or <15%
        String newType;
        if (folderPct >= 90.0 || diskFreePct < 5.0) {
            newType = "CRITICAL";
        } else if (folderPct >= 80.0 || diskFreePct < 15.0) {
            newType = "WARNING";
        } else {
            newType = null; // below threshold
        }

        String key = "STORAGE_UTILIZATION";
        Optional<SystemAlert> existing = alertRepository.findFirstByAlertKeyAndResolvedFalse(key);

        if (newType == null) {
            // Condition cleared — auto-resolve any active storage alert
            existing.ifPresent(a -> {
                a.setAlertType("RESOLVED");
                a.setResolved(true);
                alertRepository.save(a);
            });
            return;
        }

        long usedMb = usedBytes / (1024 * 1024);
        long maxMb  = storageMaxBytes / (1024 * 1024);
        String title = "Storage utilization crossed "
                + (newType.equals("CRITICAL") ? "90%" : "80%")
                + " on upload server";
        String desc = "Storage utilization at " + Math.round(folderPct)
                + "% — upload folder " + usedMb + " MB of " + maxMb
                + " MB configured capacity.";

        if (existing.isEmpty()) {
            alertRepository.save(SystemAlert.builder()
                    .title(title)
                    .description(desc)
                    .alertTime(LocalDateTime.now())
                    .alertType(newType)
                    .iconType("SYSTEM")
                    .alertKey(key)
                    .resolved(false)
                    .build());
        } else {
            // Escalate WARNING → CRITICAL if needed; ignore WARNING → WARNING (already active)
            SystemAlert alert = existing.get();
            if ("CRITICAL".equals(newType) && "WARNING".equals(alert.getAlertType())) {
                alert.setAlertType("CRITICAL");
                alert.setTitle(title);
                alert.setDescription(desc);
                alert.setAlertTime(LocalDateTime.now());
                alertRepository.save(alert);
            }
        }
    }

    private long computeUploadFolderSize() {
        Path root = Paths.get(uploadPath);
        if (!Files.exists(root)) return 0L;
        try {
            return Files.walk(root)
                    .filter(Files::isRegularFile)
                    .mapToLong(p -> p.toFile().length())
                    .sum();
        } catch (IOException e) {
            return 0L;
        }
    }
}
