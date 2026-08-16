package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.model.LectureProgress;
import com.intellecta.intellecta_backend.model.User;
import com.intellecta.intellecta_backend.model.VideoLecture;
import com.intellecta.intellecta_backend.repository.LectureProgressRepository;
import com.intellecta.intellecta_backend.repository.UserRepository;
import com.intellecta.intellecta_backend.repository.VideoLectureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LectureProgressService {

    private final LectureProgressRepository progressRepository;
    private final UserRepository userRepository;
    private final VideoLectureRepository lectureRepository;

    /**
     * Upsert: only updates if the new pct is strictly greater than the stored one.
     * This prevents the DB being spammed with no-op writes when the student
     * rewinds or re-watches the same segment.
     */
    public void upsertProgress(Long lectureId, int pct, String userEmail) {
        User user = userRepository.findByEmail(userEmail);
        if (user == null) throw new RuntimeException("User not found: " + userEmail);

        VideoLecture lecture = lectureRepository.findById(lectureId)
                .orElseThrow(() -> new RuntimeException("Lecture not found: " + lectureId));

        LectureProgress progress = progressRepository
                .findByUserAndLecture(user, lecture)
                .orElse(LectureProgress.builder().user(user).lecture(lecture).progressPct(0).build());

        // Only persist if progress has actually advanced
        if (pct > progress.getProgressPct()) {
            progress.setProgressPct(pct);
            progress.setCompleted(pct >= 90);
            progressRepository.save(progress);
        }
    }

    /**
     * Returns a map of lectureId → progressPct for all lectures the user has
     * started. Used to initialise client-side state on page load.
     */
    public Map<Long, Integer> getProgressMap(String userEmail) {
        User user = userRepository.findByEmail(userEmail);
        if (user == null) return Map.of();
        return progressRepository.findAllByUser(user)
                .stream()
                .collect(Collectors.toMap(
                        p -> p.getLecture().getId(),
                        LectureProgress::getProgressPct
                ));
    }
}
