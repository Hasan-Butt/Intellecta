package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.dto.request.QuizSubmissionRequest;
import com.intellecta.intellecta_backend.enums.QuestionType;
import com.intellecta.intellecta_backend.model.*;
import com.intellecta.intellecta_backend.repository.QuizAttemptRepository;
import com.intellecta.intellecta_backend.repository.QuizRepository;
import com.intellecta.intellecta_backend.repository.SectionalXPRepository;
import com.intellecta.intellecta_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.intellecta.intellecta_backend.security.SecurityUtils;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final UserRepository userRepository;
    private final SectionalXPRepository sectionalXPRepository;

    public List<Quiz> getAllQuizzes(Long userId) {
        List<Quiz> quizzes = new java.util.ArrayList<>(quizRepository.findAllWithQuestions());
        if (userId != null) {
            SecurityUtils.validateUser(userId);
            System.out.println("Filtering quizzes for userId: " + userId + ". Initial count: " + quizzes.size());
            // Remove quizzes already attempted by this user
            quizzes.removeIf(quiz -> {
                boolean attempted = quizAttemptRepository.existsByUserIdAndQuizId(userId, quiz.getId());
                if (attempted) {
                    System.out.println("Removing quiz: " + quiz.getTopic() + " (attempted)");
                }
                return attempted;
            });
            System.out.println("Final count: " + quizzes.size());
        }
        return quizzes;
    }

    @org.springframework.transaction.annotation.Transactional
    public Quiz createQuiz(Quiz quiz) {
        Quiz savedQuiz = quizRepository.save(quiz);
        if (quiz.getQuestions() != null) {
            for (Question q : quiz.getQuestions()) {
                q.setQuiz(savedQuiz);
            }
            savedQuiz.setQuestions(quiz.getQuestions());
            return quizRepository.save(savedQuiz);
        }
        return savedQuiz;
    }

    public Quiz getQuizById(Long id) {
        return getQuizById(id, null);
    }

    public Quiz getQuizById(Long id, Long userId) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz not found: " + id));
        if (userId != null) {
            SecurityUtils.validateUser(userId);
            quiz.setAttempted(quizAttemptRepository.existsByUserIdAndQuizId(userId, id));
        }
        return quiz;
    }

    @org.springframework.transaction.annotation.Transactional
    public QuizAttempt submitQuiz(QuizSubmissionRequest request) {
        SecurityUtils.validateUser(request.getUserId());
        if (quizAttemptRepository.existsByUserIdAndQuizId(request.getUserId(), request.getQuizId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quiz already attempted by this user.");
        }
        try {
            Quiz quiz = getQuizById(request.getQuizId());
            User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + request.getUserId()));

            List<Question> questions = quiz.getQuestions();
            Map<Long, Integer> userAnswers = request.getAnswers();
            Map<Long, String> textAnswers = request.getTextAnswers();

            System.out.println("Processing submission for quiz: " + quiz.getTopic() + " (Questions: "
                    + (questions != null ? questions.size() : 0) + ")");

            boolean hasDescriptive = questions != null && questions.stream()
                    .anyMatch(q -> q.getQuestionType() == QuestionType.DESCRIPTIVE);

            int objectiveScore = 0;
            if (userAnswers != null && questions != null) {
                for (Question q : questions) {
                    if (q.getQuestionType() != QuestionType.OBJECTIVE) continue;
                    Integer userSelection = userAnswers.get(q.getId());
                    if (userSelection != null && userSelection.equals(q.getCorrectOptionIndex())) {
                        int marks = q.getMaxMarks() != null && q.getMaxMarks() > 0 ? q.getMaxMarks() : 1;
                        objectiveScore += marks;
                    }
                }
            }

            enforceTimeLimit(quiz, request.getStartedAt());

            boolean graded = !hasDescriptive;
            int xpGained = graded ? objectiveScore * 5 : 0;

            QuizAttempt attempt = QuizAttempt.builder()
                    .user(user)
                    .quiz(quiz)
                    .score(objectiveScore)
                    .totalQuestions(questions != null ? questions.size() : 0)
                    .xpGained(xpGained)
                    .userAnswers(userAnswers != null ? userAnswers : new java.util.HashMap<>())
                    .textAnswers(textAnswers != null ? textAnswers : new java.util.HashMap<>())
                    .totalMarks(objectiveScore)
                    .graded(graded)
                    .startTime(resolveStartTime(quiz, request.getStartedAt()))
                    .endTime(LocalDateTime.now())
                    .status(graded ? "COMPLETED" : "PENDING_REVIEW")
                    .build();

            // Persist the attempt BEFORE awarding XP so a duplicate-submission race
            // (unique constraint on user_id + quiz_id) rolls back without double XP.
            QuizAttempt saved = quizAttemptRepository.save(attempt);

            if (graded) {
                user.setXp(user.getXp() + xpGained);
                userRepository.save(user);

                String category = quiz.getCategory();
                if (category == null || category.trim().isEmpty()) {
                    category = "General";
                }

                SectionalXP sectionalXP = sectionalXPRepository.findByUserAndCategory(user, category)
                        .orElse(SectionalXP.builder()
                                .user(user)
                                .category(category)
                                .xp(0L)
                                .build());

                sectionalXP.setXp(sectionalXP.getXp() + xpGained);
                sectionalXPRepository.save(sectionalXP);
            }

            System.out.println("Quiz submitted successfully. Score: " + objectiveScore + "/" + attempt.getTotalQuestions()
                    + " (graded: " + graded + ")");
            return saved;
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quiz already attempted by this user.");
        } catch (Exception e) {
            System.err.println("CRITICAL ERROR IN QUIZ SUBMISSION: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Rejects submissions that exceed the quiz time limit. Uses the client-reported
     * start timestamp with a 60s grace period. No-op when the client doesn't send
     * one or the quiz has no time limit configured.
     */
    private void enforceTimeLimit(Quiz quiz, Long startedAt) {
        if (startedAt == null || startedAt <= 0) return;
        Integer timeLimit = quiz.getTimeLimit();
        if (timeLimit == null || timeLimit <= 0) return;
        long elapsedSeconds = (System.currentTimeMillis() - startedAt) / 1000;
        if (elapsedSeconds > timeLimit * 60L + 60L) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Quiz time limit exceeded. Submission rejected.");
        }
    }

    private LocalDateTime resolveStartTime(Quiz quiz, Long startedAt) {
        if (startedAt != null && startedAt > 0) {
            return java.time.Instant.ofEpochMilli(startedAt)
                    .atZone(java.time.ZoneId.systemDefault())
                    .toLocalDateTime();
        }
        Integer timeLimit = quiz.getTimeLimit();
        return LocalDateTime.now().minusMinutes(timeLimit != null ? timeLimit : 0);
    }

    // Bug 1.2.2: return EVERY attempt (with quiz questions eagerly fetched) so the
    // frontend can average the full mastery history — not just the latest per quiz.
    public List<QuizAttempt> getAttemptsByUserId(Long userId) {
        return quizAttemptRepository.findByUserIdWithQuiz(userId);
    }
}