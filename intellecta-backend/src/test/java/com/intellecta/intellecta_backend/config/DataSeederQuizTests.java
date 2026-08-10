package com.intellecta.intellecta_backend.config;

import java.lang.reflect.Method;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.intellecta.intellecta_backend.enums.QuestionType;
import com.intellecta.intellecta_backend.model.Question;
import com.intellecta.intellecta_backend.model.Quiz;
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
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Bug 1.2.5 — a fresh dev DB must still get seeded quizzes so quiz attempts
 * (and the Mastery Deficits section) render.
 */
@ExtendWith(MockitoExtension.class)
class DataSeederQuizTests {

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

    @Test
    void seedQuizzesCreatesObjectiveQuizzesWhenNoneExist() throws Exception {
        when(quizRepository.count()).thenReturn(0L);

        Method method = DataSeeder.class.getDeclaredMethod("seedQuizzes");
        method.setAccessible(true);
        method.invoke(seeder);

        ArgumentCaptor<List<Quiz>> captor = ArgumentCaptor.forClass(List.class);
        verify(quizRepository).saveAll(captor.capture());

        List<Quiz> quizzes = captor.getValue();
        assertFalse(quizzes.isEmpty(), "quizzes must be seeded on an empty DB");
        for (Quiz quiz : quizzes) {
            assertNotNull(quiz.getTopic(), "each seeded quiz needs a topic (1.2.4 grouping key)");
            assertNotNull(quiz.getCategory());
            assertNotNull(quiz.getQuestions());
            assertFalse(quiz.getQuestions().isEmpty());
            for (Question q : quiz.getQuestions()) {
                assertEquals(QuestionType.OBJECTIVE, q.getQuestionType(),
                        "seeded quizzes are objective-only so scores map 1:1 to objective count (1.2.3)");
                assertNotNull(q.getCorrectOptionIndex());
                assertNotNull(q.getOptions());
                assertEquals(4, q.getOptions().size());
            }
        }
    }

    @Test
    void seedQuizzesSkipsWhenQuizzesAlreadyExist() throws Exception {
        when(quizRepository.count()).thenReturn(4L);

        Method method = DataSeeder.class.getDeclaredMethod("seedQuizzes");
        method.setAccessible(true);
        method.invoke(seeder);

        verify(quizRepository, never()).saveAll(org.mockito.ArgumentMatchers.any());
    }
}