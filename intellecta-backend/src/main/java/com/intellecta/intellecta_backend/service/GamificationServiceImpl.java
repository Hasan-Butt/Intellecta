package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.dto.response.BadgeDefinitionResponse;
import com.intellecta.intellecta_backend.model.Achievement;
import com.intellecta.intellecta_backend.model.BadgeDefinition;
import com.intellecta.intellecta_backend.model.StudySession;
import com.intellecta.intellecta_backend.model.User;
import com.intellecta.intellecta_backend.repository.AchievementRepository;
import com.intellecta.intellecta_backend.repository.BadgeDefinitionRepository;
import com.intellecta.intellecta_backend.repository.NotesRepository;
import com.intellecta.intellecta_backend.repository.StudySessionRepository;
import com.intellecta.intellecta_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GamificationServiceImpl implements GamificationService {

    private final UserRepository            userRepo;
    private final StudySessionRepository    sessionRepo;
    private final NotesRepository           notesRepo;
    private final AchievementRepository     achievementRepo;
    private final BadgeDefinitionRepository badgeRepo;
    private final BadgeDefinitionService    badgeService;

    @Value("${badge.serve.base-url:http://localhost:8080/api/badges}")
    private String serveBaseUrl;

    @Override
    public List<BadgeDefinitionResponse> checkAndAwardBadges(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        // Eagerly load what we need
        List<StudySession> sessions = sessionRepo.findByUserIdOrderByStartTimeDesc(userId);
        long totalNotes             = notesRepo.countByUserId(userId);
        Integer totalPomodoros      = sessionRepo.sumPomodorosByUserId(userId);
        int pomodoros               = totalPomodoros != null ? totalPomodoros : 0;

        List<BadgeDefinitionResponse> newlyAwarded = new ArrayList<>();

        for (BadgeDefinition badge : badgeRepo.findAll()) {
            // Skip if already earned
            if (achievementRepo.existsByUserIdAndBadgeName(userId, badge.getBadgeKey())) continue;

            boolean qualifies = evaluate(badge, user, sessions, totalNotes, pomodoros);
            if (qualifies) {
                Achievement achievement = Achievement.builder()
                        .user(user)
                        .badgeName(badge.getBadgeKey())
                        .description(badge.getDescription())
                        .build();
                achievementRepo.save(achievement);

                String imageUrl = badge.getImageUrl();

                newlyAwarded.add(BadgeDefinitionResponse.builder()
                        .id(badge.getId())
                        .badgeKey(badge.getBadgeKey())
                        .displayName(badge.getDisplayName())
                        .description(badge.getDescription())
                        .rarity(badge.getRarity())
                        .imageUrl(imageUrl)
                        .earned(true)
                        .earnedAt(java.time.LocalDateTime.now())
                        .build());
            }
        }

        return newlyAwarded;
    }

    // ── Rule evaluator ────────────────────────────────────────────────────────

    private boolean evaluate(BadgeDefinition badge, User user,
                             List<StudySession> sessions, long totalNotes, int pomodoros) {
        int threshold = badge.getRuleThreshold();
        return switch (badge.getRuleType()) {

            case "STREAK_DAYS" ->
                    user.getStreakDays() >= threshold;

            case "TOTAL_SESSIONS" ->
                    sessions.size() >= threshold;

            case "SESSION_DURATION" ->
                    sessions.stream().anyMatch(s -> s.getDurationMinutes() >= threshold);

            case "DEEP_WORK_SESSION" ->
                    sessions.stream().anyMatch(s -> s.isDeepWork() && s.getDurationMinutes() >= threshold);

            case "EARLY_BIRD" ->
                    sessions.stream().filter(s ->
                            s.getStartTime() != null && s.getStartTime().getHour() < 8).count() >= threshold;

            case "NIGHT_OWL" ->
                    sessions.stream().filter(s ->
                            s.getStartTime() != null && s.getStartTime().getHour() >= 22).count() >= threshold;

            case "TOTAL_NOTES" ->
                    totalNotes >= threshold;

            case "TOTAL_POMODOROS" ->
                    pomodoros >= threshold;

            default -> false;
        };
    }
}
