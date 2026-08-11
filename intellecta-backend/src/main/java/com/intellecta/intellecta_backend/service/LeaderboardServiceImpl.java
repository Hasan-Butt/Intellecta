package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.dto.response.LeaderboardEntryDTO;
import com.intellecta.intellecta_backend.dto.response.PeerComparisonDTO;
import com.intellecta.intellecta_backend.dto.response.PeerComparisonDTO.PeerStatsDTO;
import com.intellecta.intellecta_backend.enums.UserRoles;
import com.intellecta.intellecta_backend.model.SectionalXP;
import com.intellecta.intellecta_backend.model.StudySession;
import com.intellecta.intellecta_backend.model.User;
import com.intellecta.intellecta_backend.repository.DocumentRepository;
import com.intellecta.intellecta_backend.repository.NotesRepository;
import com.intellecta.intellecta_backend.repository.SectionalXPRepository;
import com.intellecta.intellecta_backend.repository.StudySessionRepository;
import com.intellecta.intellecta_backend.repository.UserRepository;
import com.intellecta.intellecta_backend.util.LevelUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaderboardServiceImpl implements LeaderboardService {

    private final UserRepository userRepository;
    private final SectionalXPRepository sectionalXPRepository;
    private final StudySessionRepository sessionRepository;
    private final NotesRepository notesRepository;
    private final DocumentRepository documentRepository;

    @Override
    public List<LeaderboardEntryDTO> getGlobalLeaderboard(Long userId) {
        List<User> allUsers = userRepository.findAll().stream()
            .filter(u -> u.getRole() != UserRoles.ADMIN)
            .collect(java.util.stream.Collectors.toList());
        allUsers.sort(Comparator.comparingLong(User::getXp).reversed());

        // Single aggregate query for focus minutes — avoids one query per user
        Map<Long, Long> focusMinutesByUser = new java.util.HashMap<>();
        for (Object[] row : sessionRepository.totalFocusMinutesByUser()) {
            focusMinutesByUser.put(((Number) row[0]).longValue(), ((Number) row[1]).longValue());
        }

        List<LeaderboardEntryDTO> board = new ArrayList<>();
        int currentRank = 1;
        int displayRank = 1;
        long prevXp = -1;
        for (User u : allUsers) {
            if (u.getXp() != prevXp) {
                displayRank = currentRank;
                prevXp = u.getXp();
            }
            long focusHours = Math.round(focusMinutesByUser.getOrDefault(u.getId(), 0L) / 60.0);

            int level = LevelUtils.calculateLevel(u.getXp());
            long nextLevelXp  = LevelUtils.nextLevelXp(level);
            long prevLevelXp  = LevelUtils.prevLevelXp(level);
            int xpPct = LevelUtils.xpProgressPct(u.getXp(), level);

            boolean isMe = u.getId().equals(userId);
            boolean isAnon = u.isAnonymousMode();
            String displayName = isAnon ? (isMe ? u.getUsername() : "Anonymous") : u.getUsername();
            String displayAvatar = (isAnon && !isMe) ? null : u.getAvatarUrl();

            board.add(LeaderboardEntryDTO.builder()
                .rank(displayRank)
                .userId(u.getId())
                .username(displayName)
                .focusHours(focusHours)
                .xp(u.getXp())
                .level(level)
                .xpProgressPct(xpPct)
                .discipline("General")
                .avatarUrl(displayAvatar)
                .isCurrentUser(isMe)
                .build());
            currentRank++;
        }
        return board;
    }

    @Override
    public List<LeaderboardEntryDTO> getSectionalLeaderboard(Long userId, String category) {
        List<SectionalXP> allSectionalXP = sectionalXPRepository.findAll();
        List<SectionalXP> filtered = allSectionalXP.stream()
                .filter(s -> s.getCategory().equalsIgnoreCase(category))
                .filter(s -> s.getUser() != null && s.getUser().getRole() != UserRoles.ADMIN)
                .sorted(Comparator.comparingLong(SectionalXP::getXp).reversed())
                .toList();

        List<LeaderboardEntryDTO> board = new ArrayList<>();
        int currentRank = 1;
        int displayRank = 1;
        long prevXp = -1;
        for (SectionalXP sxp : filtered) {
            if (sxp.getXp() != prevXp) {
                displayRank = currentRank;
                prevXp = sxp.getXp();
            }
            User u = sxp.getUser();
            // Level/progress reflect the student's GLOBAL level (total XP), not
            // the sectional XP — sectional rank and global level are separate concepts
            int level = LevelUtils.calculateLevel(u.getXp());
            long nextLevelXp  = LevelUtils.nextLevelXp(level);
            long prevLevelXp  = LevelUtils.prevLevelXp(level);
            int xpPct = LevelUtils.xpProgressPct(u.getXp(), level);

            boolean isMe = u.getId().equals(userId);
            boolean isAnon = u.isAnonymousMode();
            String displayName = isAnon ? (isMe ? u.getUsername() : "Anonymous") : u.getUsername();
            String displayAvatar = (isAnon && !isMe) ? null : u.getAvatarUrl();

            board.add(LeaderboardEntryDTO.builder()
                .rank(displayRank)
                .userId(u.getId())
                .username(displayName)
                .focusHours(0)
                .xp(sxp.getXp())
                .level(level)
                .xpProgressPct(xpPct)
                .discipline(sxp.getCategory())
                .avatarUrl(displayAvatar)
                .isCurrentUser(isMe)
                .build());
            currentRank++;
        }
        return board;
    }

    @Override
    public List<String> getSectionalCategories() {
        return sectionalXPRepository.findAll().stream()
                .map(SectionalXP::getCategory)
                .filter(c -> c != null && !c.trim().isEmpty())
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    @Override
    public PeerComparisonDTO comparePeers(Long userId, Long peerId) {
        // Build global rank map
        List<User> allUsers = userRepository.findAll().stream()
            .filter(u -> u.getRole() != UserRoles.ADMIN)
            .collect(java.util.stream.Collectors.toList());
        allUsers.sort(Comparator.comparingLong(User::getXp).reversed());

        Map<Long, Integer> rankMap = new LinkedHashMap<>();
        int currentRank = 1, displayRank = 1;
        long prevXp = -1;
        for (User u : allUsers) {
            if (u.getXp() != prevXp) { displayRank = currentRank; prevXp = u.getXp(); }
            rankMap.put(u.getId(), displayRank);
            currentRank++;
        }

        User me   = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found: " + userId));
        User peer = userRepository.findById(peerId).orElseThrow(() -> new RuntimeException("Peer not found: " + peerId));

        if (peer.getRole() == UserRoles.ADMIN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot compare with an admin user.");
        }

        return PeerComparisonDTO.builder()
            .me(buildStats(me, rankMap.getOrDefault(userId, 0), true))
            .peer(buildStats(peer, rankMap.getOrDefault(peerId, 0), false))
            .build();
    }

    // ── Private helpers ────────────────────────────────────────────────────────

    private PeerStatsDTO buildStats(User u, int globalRank, boolean isMe) {
        long xp = u.getXp();
        int level = LevelUtils.calculateLevel(xp);
        long nextLevelXp = LevelUtils.nextLevelXp(level);
        long prevLevelXp = LevelUtils.prevLevelXp(level);
        int xpPct = LevelUtils.xpProgressPct(xp, level);

        long totalMinutes = sessionRepository
            .findByUserIdOrderByStartTimeDesc(u.getId())
            .stream().mapToLong(StudySession::getDurationMinutes).sum();
        long focusHours = Math.round(totalMinutes / 60.0);

        long totalSessions = sessionRepository.countByUserId(u.getId());
        int totalPomodoros = Optional.ofNullable(sessionRepository.sumPomodorosByUserId(u.getId())).orElse(0);
        long totalNotes = notesRepository.countByUserId(u.getId());
        long totalDocs  = documentRepository.countByUserId(u.getId());

        Map<String, Long> sectionalXp = sectionalXPRepository.findByUserId(u.getId())
            .stream().collect(Collectors.toMap(SectionalXP::getCategory, SectionalXP::getXp));

        // REAL 14-day heatmap derived from actual study sessions, scaled 0-4
        java.time.LocalDate today = java.time.LocalDate.now();
        Map<java.time.LocalDate, Long> minutesByDay = new java.util.HashMap<>();
        for (Object[] row : sessionRepository.dailyFocusMinutes(u.getId(), today.minusDays(13).atStartOfDay())) {
            minutesByDay.put(((java.sql.Date) row[0]).toLocalDate(), ((Number) row[1]).longValue());
        }
        List<Integer> heatmap = new ArrayList<>();
        for (int i = 13; i >= 0; i--) {
            long minutes = minutesByDay.getOrDefault(today.minusDays(i), 0L);
            heatmap.add(focusIntensity(minutes));
        }

        // Anonymous mode: mask other users, keep the requester's own identity
        boolean isAnon = u.isAnonymousMode();
        String username = isAnon ? (isMe ? u.getUsername() : "Anonymous") : u.getUsername();
        String avatarUrl = (isAnon && !isMe) ? null : u.getAvatarUrl();

        return PeerStatsDTO.builder()
            .userId(u.getId())
            .username(username)
            .avatarUrl(avatarUrl)
            .globalRank(globalRank)
            .xp(xp)
            .level(level)
            .levelTitle(resolveLevelTitle(level))
            .xpProgressPct(xpPct)
            .focusHours(focusHours)
            .focusMinutes(totalMinutes)
            .totalSessions(totalSessions)
            .totalPomodoros(totalPomodoros)
            .streakDays(u.getStreakDays())
            .totalNotes(totalNotes)
            .totalDocuments(totalDocs)
            .sectionalXp(sectionalXp)
            .heatmap(heatmap)
            .build();
    }

    private int focusIntensity(long minutes) {
        if (minutes <= 0) return 0;
        if (minutes < 15) return 1;
        if (minutes < 45) return 2;
        if (minutes < 90) return 3;
        return 4;
    }

    private String resolveLevelTitle(int level) {
        if (level <= 3)  return "Beginner";
        if (level <= 6)  return "Apprentice";
        if (level <= 10) return "Scholar";
        if (level <= 15) return "Expert";
        return "Master";
    }
}
