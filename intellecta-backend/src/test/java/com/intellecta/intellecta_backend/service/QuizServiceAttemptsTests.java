package com.intellecta.intellecta_backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.intellecta.intellecta_backend.model.Quiz;
import com.intellecta.intellecta_backend.model.QuizAttempt;
import com.intellecta.intellecta_backend.repository.QuizAttemptRepository;
import com.intellecta.intellecta_backend.repository.QuizRepository;
import com.intellecta.intellecta_backend.repository.SectionalXPRepository;
import com.intellecta.intellecta_backend.repository.UserRepository;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Bug 1.2.2 — getAttemptsByUserId must return ALL attempts (full history),
 * not just the latest attempt per quiz.
 */
@ExtendWith(MockitoExtension.class)
class QuizServiceAttemptsTests {

    @Mock private QuizRepository quizRepository;
    @Mock private QuizAttemptRepository quizAttemptRepository;
    @Mock private UserRepository userRepository;
    @Mock private SectionalXPRepository sectionalXPRepository;

    private QuizService quizService;

    @BeforeEach
    void setUp() {
        quizService = new QuizService(quizRepository, quizAttemptRepository, userRepository, sectionalXPRepository);
    }

    @Test
    void returnsAllAttemptsIncludingMultipleAttemptsOfTheSameQuiz() {
        Quiz quiz = Quiz.builder().id(1L).topic("Calculus").category("Math").build();
        QuizAttempt older = QuizAttempt.builder().id(1L).quiz(quiz)
                .score(3).totalQuestions(5).graded(true)
                .endTime(LocalDateTime.of(2025, 1, 10, 12, 0)).build();
        QuizAttempt newer = QuizAttempt.builder().id(2L).quiz(quiz)
                .score(5).totalQuestions(5).graded(true)
                .endTime(LocalDateTime.of(2025, 2, 10, 12, 0)).build();

        when(quizAttemptRepository.findByUserIdWithQuiz(1L)).thenReturn(List.of(older, newer));

        List<QuizAttempt> result = quizService.getAttemptsByUserId(1L);

        assertEquals(2, result.size(),
                "every attempt must be returned so the frontend can average real history");
        assertSame(older, result.get(0));
        assertSame(newer, result.get(1));
        verify(quizAttemptRepository).findByUserIdWithQuiz(1L);
    }

    @Test
    void returnsUngradedAttemptsToo() {
        Quiz quiz = Quiz.builder().id(1L).topic("OS").category("CS").build();
        QuizAttempt pending = QuizAttempt.builder().id(1L).quiz(quiz)
                .score(0).totalQuestions(4).graded(false)
                .status("PENDING_REVIEW")
                .endTime(LocalDateTime.of(2025, 3, 1, 9, 0)).build();

        when(quizAttemptRepository.findByUserIdWithQuiz(1L)).thenReturn(List.of(pending));

        List<QuizAttempt> result = quizService.getAttemptsByUserId(1L);

        assertEquals(1, result.size());
        assertSame(pending, result.get(0));
        // filtering ungraded attempts is a presentation concern (focus.jsx), not
        // something the history endpoint should pre-decide
        assertFalse(result.get(0).isGraded());
    }
}