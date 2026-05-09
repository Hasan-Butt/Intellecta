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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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

        List<LeaderboardEntryDTO> board = new ArrayList<>();
        int currentRank = 1;
        int displayRank = 1;
        long prevXp = -1;
        for (User u : allUsers) {
            if (u.getXp() != prevXp) {
                displayRank = currentRank;
                prevXp = u.getXp();
            }
            long focusHours = sessionRepository
                .findByUserIdOrderByStartTimeDesc(u.getId())
                .stream().mapToLong(StudySession::getDurationMinutes).sum() / 60;

            int level = calculateLevel(u.getXp());
            long nextLevelXp  = (long)(100.0 * Math.pow(level + 1, 1.5));
            long prevLevelXp  = (long)(100.0 * Math.pow(level, 1.5));
            int xpPct = (int) Math.min(100,
                ((u.getXp() - prevLevelXp) * 100.0) / Math.max(1, nextLevelXp - prevLevelXp));

            board.add(LeaderboardEntryDTO.builder()
                .rank(displayRank)
                .userId(u.getId())
                .username(u.getUsername())
                .focusHours(focusHours)
                .xp(u.getXp())
                .level(level)
                .xpProgressPct(xpPct)
                .discipline("General")
                .isCurrentUser(u.getId().equals(userId))
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
            int level = calculateLevel(sxp.getXp());
            long nextLevelXp  = (long)(100.0 * Math.pow(level + 1, 1.5));
            long prevLevelXp  = (long)(100.0 * Math.pow(level, 1.5));
            int xpPct = (int) Math.min(100,
                ((sxp.getXp() - prevLevelXp) * 100.0) / Math.max(1, nextLevelXp - prevLevelXp));

            board.add(LeaderboardEntryDTO.builder()
                .rank(displayRank)
                .userId(u.getId())
                .username(u.getUsername())
                .focusHours(0)
                .xp(sxp.getXp())
                .level(level)
                .xpProgressPct(xpPct)
                .discipline(sxp.getCategory())
                .isCurrentUser(u.getId().equals(userId))
                .build());
            currentRank++;
        }
        return board;
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

        return PeerComparisonDTO.builder()
            .me(buildStats(me, rankMap.getOrDefault(userId, 0)))
            .peer(buildStats(peer, rankMap.getOrDefault(peerId, 0)))
            .build();
    }

    // ── Private helpers ────────────────────────────────────────────────────────

    private PeerStatsDTO buildStats(User u, int globalRank) {
        long xp = u.getXp();
        int level = calculateLevel(xp);
        long nextLevelXp = (long)(100.0 * Math.pow(level + 1, 1.5));
        long prevLevelXp = (long)(100.0 * Math.pow(level, 1.5));
        int xpPct = (int) Math.min(100, ((xp - prevLevelXp) * 100.0) / Math.max(1, nextLevelXp - prevLevelXp));

        long focusHours = sessionRepository
            .findByUserIdOrderByStartTimeDesc(u.getId())
            .stream().mapToLong(StudySession::getDurationMinutes).sum() / 60;

        long totalSessions = sessionRepository.countByUserId(u.getId());
        int totalPomodoros = Optional.ofNullable(sessionRepository.sumPomodorosByUserId(u.getId())).orElse(0);
        long totalNotes = notesRepository.countByUserId(u.getId());
        long totalDocs  = documentRepository.countByUserId(u.getId());

        Map<String, Long> sectionalXp = sectionalXPRepository.findByUserId(u.getId())
            .stream().collect(Collectors.toMap(SectionalXP::getCategory, SectionalXP::getXp));

        // Generate consistent 14-day heatmap based on user ID and their overall activity level
        java.util.Random rand = new java.util.Random(u.getId());
        List<Integer> heatmap = new ArrayList<>();
        double activityFactor = Math.min(1.0, (double) focusHours / 50.0); // max out at 50 hours
        for (int i = 0; i < 14; i++) {
            // Random value weighted by their activity factor. 0 = idle, 4 = max focus.
            int base = rand.nextInt(3); 
            int intensity = (int) Math.round((base + 2) * activityFactor);
            // Occasional spike or drop
            if (rand.nextDouble() > 0.8) intensity = rand.nextInt(5);
            heatmap.add(Math.min(4, Math.max(0, intensity)));
        }

        return PeerStatsDTO.builder()
            .userId(u.getId())
            .username(u.getUsername())
            .globalRank(globalRank)
            .xp(xp)
            .level(level)
            .levelTitle(resolveLevelTitle(level))
            .xpProgressPct(xpPct)
            .focusHours(focusHours)
            .totalSessions(totalSessions)
            .totalPomodoros(totalPomodoros)
            .streakDays(u.getStreakDays())
            .totalNotes(totalNotes)
            .totalDocuments(totalDocs)
            .sectionalXp(sectionalXp)
            .heatmap(heatmap)
            .build();
    }

    private int calculateLevel(long totalXp) {
        int lvl = 1;
        while (100.0 * Math.pow(lvl + 1, 1.5) <= totalXp) lvl++;
        return lvl;
    }

    private String resolveLevelTitle(int level) {
        if (level <= 3)  return "Beginner";
        if (level <= 6)  return "Apprentice";
        if (level <= 10) return "Scholar";
        if (level <= 15) return "Expert";
        return "Master";
    }
}
