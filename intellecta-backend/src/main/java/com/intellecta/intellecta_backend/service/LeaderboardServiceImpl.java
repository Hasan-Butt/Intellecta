package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.dto.response.LeaderboardEntryDTO;
import com.intellecta.intellecta_backend.model.SectionalXP;
import com.intellecta.intellecta_backend.model.StudySession;
import com.intellecta.intellecta_backend.model.User;
import com.intellecta.intellecta_backend.repository.SectionalXPRepository;
import com.intellecta.intellecta_backend.repository.StudySessionRepository;
import com.intellecta.intellecta_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaderboardServiceImpl implements LeaderboardService {

    private final UserRepository userRepository;
    private final SectionalXPRepository sectionalXPRepository;
    private final StudySessionRepository sessionRepository;

    @Override
    public List<LeaderboardEntryDTO> getGlobalLeaderboard(Long userId) {
        List<User> allUsers = userRepository.findAll();
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
        List<SectionalXP> allSectionalXP = sectionalXPRepository.findAll(); // We'll filter by category if needed, but no findByCategory method exists yet?
        
        // Wait, sectionalXPRepository has findByUserAndCategory but no findByCategory. Let's filter manually or use a stream if needed.
        // I will use stream for now to avoid creating new repository methods if possible.
        List<SectionalXP> filtered = allSectionalXP.stream()
                .filter(s -> s.getCategory().equalsIgnoreCase(category))
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
            
            // Calculate sectional level based on sectional XP using the same formula
            int level = calculateLevel(sxp.getXp());
            long nextLevelXp  = (long)(100.0 * Math.pow(level + 1, 1.5));
            long prevLevelXp  = (long)(100.0 * Math.pow(level, 1.5));
            int xpPct = (int) Math.min(100,
                ((sxp.getXp() - prevLevelXp) * 100.0) / Math.max(1, nextLevelXp - prevLevelXp));

            board.add(LeaderboardEntryDTO.builder()
                .rank(displayRank)
                .userId(u.getId())
                .username(u.getUsername())
                .focusHours(0) // Focus hours might be hard to calculate per section, use 0 for now
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

    private int calculateLevel(long totalXp) {
        int lvl = 1;
        while (100.0 * Math.pow(lvl + 1, 1.5) <= totalXp) {
            lvl++;
        }
        return lvl;
    }
}
