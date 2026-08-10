package com.intellecta.intellecta_backend.config;

import java.lang.reflect.Method;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.intellecta.intellecta_backend.enums.UserRoles;
import com.intellecta.intellecta_backend.model.DistractionEntry;
import com.intellecta.intellecta_backend.model.StudySession;
import com.intellecta.intellecta_backend.model.User;
import com.intellecta.intellecta_backend.repository.AchievementRepository;
import com.intellecta.intellecta_backend.repository.AppGovernanceRuleRepository;
import com.intellecta.intellecta_backend.repository.DistractionRepository;
import com.intellecta.intellecta_backend.repository.QuizAttemptRepository;
import com.intellecta.intellecta_backend.repository.QuizRepository;
import com.intellecta.intellecta_backend.repository.StudySessionRepository;
import com.intellecta.intellecta_backend.repository.SubjectRepository;
import com.intellecta.intellecta_backend.repository.SystemConfigRepository;
import com.intellecta.intellecta_backend.repository.UserRepository;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Bug 1.1.1 — seeded distractions must receive a {@code loggedAt} that falls
 * INSIDE one of the student's seeded session windows, so focus analytics no
 * longer sees every session as distraction-free (Concentration Quality 100%).
 */
@ExtendWith(MockitoExtension.class)
class DataSeederDistractionTests {

    @Mock private UserRepository userRepository;
    @Mock private StudySessionRepository studySessionRepository;
    @Mock private QuizAttemptRepository quizAttemptRepository;
    @Mock private DistractionRepository distractionRepository;
    @Mock private AchievementRepository achievementRepository;
    @Mock private QuizRepository quizRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private SystemConfigRepository systemConfigRepository;
    @Mock private AppGovernanceRuleRepository appGovernanceRuleRepository;
    @Mock private SubjectRepository subjectRepository;

    private DataSeeder seeder;

    @BeforeEach
    void setUp() {
        seeder = new DataSeeder(userRepository, studySessionRepository,
                quizAttemptRepository, distractionRepository, achievementRepository,
                quizRepository, passwordEncoder, systemConfigRepository,
                appGovernanceRuleRepository, subjectRepository);
    }

    private User student() {
        return new User("Test Student", "student@intellecta.com", "password123", UserRoles.STUDENT);
    }

    @Test
    void pickDistractionLoggedAtFallsInsideASelectedSessionWindow() throws Exception {
        User student = student();
        LocalDateTime start = LocalDateTime.of(2025, 3, 10, 9, 0);
        LocalDateTime end   = start.plusMinutes(90);
        when(studySessionRepository.findByUserIdOrderByStartTimeDesc(any()))
                .thenReturn(List.of(StudySession.builder()
                        .startTime(start).endTime(end).build()));

        Method method = DataSeeder.class.getDeclaredMethod("pickDistractionLoggedAt", User.class, java.util.Random.class);
        method.setAccessible(true);

        for (int i = 0; i < 50; i++) {
            LocalDateTime picked = (LocalDateTime) method.invoke(seeder, student, new java.util.Random(555L));
            assertNotNull(picked);
            assertFalse(picked.isBefore(start), "distraction must start inside the session window: " + picked);
            assertFalse(picked.isAfter(end), "distraction must start inside the session window: " + picked);
        }
    }

    @Test
    void pickDistractionLoggedAtFallsBackWhenStudentHasNoCompletedSessions() throws Exception {
        User student = student();
        when(studySessionRepository.findByUserIdOrderByStartTimeDesc(any())).thenReturn(List.of());

        Method method = DataSeeder.class.getDeclaredMethod("pickDistractionLoggedAt", User.class, java.util.Random.class);
        method.setAccessible(true);

        LocalDateTime picked = (LocalDateTime) method.invoke(seeder, student, new java.util.Random(555L));
        assertNotNull(picked);
        // fallback boundary: within the last 90 days
        assertTrue(picked.isAfter(LocalDateTime.now().minusDays(91)));
        assertFalse(picked.isAfter(LocalDateTime.now()));
    }

    @Test
    void allStampedWithinTwoMinutesDetectsBatchStamping() throws Exception {
        LocalDateTime t0 = LocalDateTime.of(2025, 4, 1, 12, 0, 0);
        List<DistractionEntry> clustered = List.of(
                DistractionEntry.builder().loggedAt(t0).build(),
                DistractionEntry.builder().loggedAt(t0.plusMinutes(1)).build(),
                DistractionEntry.builder().loggedAt(t0.plusSeconds(30)).build());
        List<DistractionEntry> spread = List.of(
                DistractionEntry.builder().loggedAt(t0).build(),
                DistractionEntry.builder().loggedAt(t0.plusHours(5)).build());

        Method method = DataSeeder.class.getDeclaredMethod("allStampedWithinTwoMinutes", List.class);
        method.setAccessible(true);

        assertTrue((boolean) method.invoke(seeder, clustered));
        assertFalse((boolean) method.invoke(seeder, spread));
    }

    @Test
    void repairBuggySeededDistractionTimestampsReStampsOnlyBatchStampedRows() throws Exception {
        // Student has 2 distractions, both stamped at the old seeder run time
        // (clustered within 1 minute, outside every session window).
        User student = student();
        List<StudySession> sessions = List.of(StudySession.builder()
                .startTime(LocalDateTime.of(2025, 3, 10, 9, 0))
                .endTime(LocalDateTime.of(2025, 3, 10, 10, 30))
                .build());

        LocalDateTime oldStamp = LocalDateTime.now().minusDays(1);
        DistractionEntry d1 = DistractionEntry.builder()
                .user(student).reason("Got distracted by Instagram Reels")
                .loggedAt(oldStamp).build();
        DistractionEntry d2 = DistractionEntry.builder()
                .user(student).reason("Friend called from back home")
                .loggedAt(oldStamp.plusSeconds(30)).build();
        List<DistractionEntry> buggy = new ArrayList<>(List.of(d1, d2));

        when(userRepository.findAll()).thenReturn(List.of(student));
        when(distractionRepository.findByUserIdOrderByLoggedAtDesc(any())).thenReturn(buggy);
        when(studySessionRepository.findByUserIdOrderByStartTimeDesc(any())).thenReturn(sessions);

        Method method = DataSeeder.class.getDeclaredMethod("repairBuggySeededDistractionTimestamps");
        method.setAccessible(true);
        method.invoke(seeder);

        verify(distractionRepository).saveAll(buggy);
        for (DistractionEntry d : buggy) {
            assertFalse(d.getLoggedAt().isBefore(sessions.get(0).getStartTime()),
                    "repaired distraction must be inside a session window");
            assertFalse(d.getLoggedAt().isAfter(sessions.get(0).getEndTime()),
                    "repaired distraction must be inside a session window");
        }
    }

    @Test
    void repairLeavesRealUserLoggedDistractionsUntouched() throws Exception {
        User student = student();
        List<StudySession> sessions = List.of(StudySession.builder()
                .startTime(LocalDateTime.of(2025, 3, 10, 9, 0))
                .endTime(LocalDateTime.of(2025, 3, 10, 10, 30))
                .build());

        // Spread over hours — NOT the batch-stamped signature.
        LocalDateTime t0 = LocalDateTime.now().minusDays(3);
        DistractionEntry real1 = DistractionEntry.builder()
                .user(student).reason("Phone call").loggedAt(t0).build();
        DistractionEntry real2 = DistractionEntry.builder()
                .user(student).reason("Email ping").loggedAt(t0.plusHours(4)).build();

        when(userRepository.findAll()).thenReturn(List.of(student));
        when(distractionRepository.findByUserIdOrderByLoggedAtDesc(any())).thenReturn(new ArrayList<>(List.of(real1, real2)));
        when(studySessionRepository.findByUserIdOrderByStartTimeDesc(any())).thenReturn(sessions);

        Method method = DataSeeder.class.getDeclaredMethod("repairBuggySeededDistractionTimestamps");
        method.setAccessible(true);
        method.invoke(seeder);

        verify(distractionRepository, never()).saveAll(any());
    }
}