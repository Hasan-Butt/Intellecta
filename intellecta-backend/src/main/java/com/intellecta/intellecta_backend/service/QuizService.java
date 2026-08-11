package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.dto.request.QuizSubmissionRequest;
import com.intellecta.intellecta_backend.enums.QuestionType;
import com.intellecta.intellecta_backend.model.*;
import com.intellecta.intellecta_backend.repository.QuizAttemptRepository;
import com.intellecta.intellecta_backend.repository.QuizRepository;
import com.intellecta.intellecta_backend.repository.SectionalXPRepository;
import com.intellecta.intellecta_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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
        return quizRepository.findById(id).orElseThrow(() -> new RuntimeException("Quiz not found"));
    }

    @org.springframework.transaction.annotation.Transactional
    public QuizAttempt submitQuiz(QuizSubmissionRequest request) {
        SecurityUtils.validateUser(request.getUserId());
        if (quizAttemptRepository.existsByUserIdAndQuizId(request.getUserId(), request.getQuizId())) {
            throw new RuntimeException("Quiz already attempted by this user.");
        }
        try {
            Quiz quiz = getQuizById(request.getQuizId());
            User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found: " + request.getUserId()));

            List<Question> questions = quiz.getQuestions();
            Map<Long, Integer> userAnswers = request.getAnswers();
            Map<Long, String> textAnswers = request.getTextAnswers();

            System.out.println("Processing submission for quiz: " + quiz.getTopic() + " (Questions: "
                    + (questions != null ? questions.size() : 0) + ")");

            boolean hasDescriptive = questions != null && questions.stream()
                    .anyMatch(q -> q.getQuestionType() == QuestionType.DESCRIPTIVE);

            int objectiveScore = 0;
            if (!hasDescriptive && userAnswers != null && questions != null) {
                for (Question q : questions) {
                    if (q.getQuestionType() != QuestionType.OBJECTIVE) continue;
                    Integer userSelection = userAnswers.get(q.getId());
                    if (userSelection != null && userSelection.equals(q.getCorrectOptionIndex())) {
                        objectiveScore++;
                    }
                }
            }

            boolean graded = !hasDescriptive;
            int xpGained = graded ? objectiveScore * 5 : 0;

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
                    .startTime(LocalDateTime.now().minusMinutes(quiz.getTimeLimit()))
                    .endTime(LocalDateTime.now())
                    .status(graded ? "COMPLETED" : "PENDING_REVIEW")
                    .build();

            QuizAttempt saved = quizAttemptRepository.save(attempt);
            System.out.println("Quiz submitted successfully. Score: " + objectiveScore + "/" + attempt.getTotalQuestions()
                    + " (graded: " + graded + ")");
            return saved;
        } catch (Exception e) {
            System.err.println("CRITICAL ERROR IN QUIZ SUBMISSION: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public List<QuizAttempt> getAttemptsByUserId(Long userId) {
        List<QuizAttempt> attempts = quizAttemptRepository.findByUserIdWithQuiz(userId);

        Map<Long, QuizAttempt> latestPerQuiz = new LinkedHashMap<>();
        for (QuizAttempt attempt : attempts) {
            if (attempt.getQuiz() == null) continue; // skip orphaned attempts
            Long quizId = attempt.getQuiz().getId();
            QuizAttempt existing = latestPerQuiz.get(quizId);
            if (existing == null || isAfter(attempt, existing)) {
                latestPerQuiz.put(quizId, attempt);
            }
        }

        return latestPerQuiz.values().stream()
                .sorted(Comparator.comparing(QuizAttempt::getEndTime, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    private boolean isAfter(QuizAttempt a, QuizAttempt b) {
        if (a.getEndTime() == null) return false;
        if (b.getEndTime() == null) return true;
        return a.getEndTime().isAfter(b.getEndTime());
    }
}