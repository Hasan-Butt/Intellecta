package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.dto.response.SubmissionDetailResponse;
import com.intellecta.intellecta_backend.enums.QuestionType;
import com.intellecta.intellecta_backend.model.Question;
import com.intellecta.intellecta_backend.model.Quiz;
import com.intellecta.intellecta_backend.model.QuizAttempt;
import com.intellecta.intellecta_backend.model.SectionalXP;
import com.intellecta.intellecta_backend.model.User;
import com.intellecta.intellecta_backend.repository.QuizAttemptRepository;
import com.intellecta.intellecta_backend.repository.SectionalXPRepository;
import com.intellecta.intellecta_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.intellecta.intellecta_backend.security.SecurityUtils;

@Service
@RequiredArgsConstructor
public class QuizGradingService {

    private final QuizAttemptRepository quizAttemptRepository;
    private final UserRepository userRepository;
    private final SectionalXPRepository sectionalXPRepository;

    public List<QuizAttempt> getPendingSubmissions() {
        return quizAttemptRepository.findByStatusOrderByIdDesc("PENDING_REVIEW");
    }

    @Transactional(readOnly = true)
    public SubmissionDetailResponse getSubmissionDetail(Long attemptId) {
        QuizAttempt attempt = quizAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found: " + attemptId));

        Quiz quiz = attempt.getQuiz();
        User user = attempt.getUser();

        List<SubmissionDetailResponse.QuestionView> views = new ArrayList<>();
        if (quiz.getQuestions() != null) {
            for (Question q : quiz.getQuestions()) {
                Integer awarded = attempt.getQuestionMarks() != null
                        ? attempt.getQuestionMarks().get(q.getId()) : null;
                boolean isDr = q.getQuestionType() == QuestionType.DESCRIPTIVE;
                views.add(SubmissionDetailResponse.QuestionView.builder()
                        .id(q.getId())
                        .text(q.getText())
                        .type(q.getQuestionType())
                        .options(q.getOptions())
                        .correctOptionIndex(q.getCorrectOptionIndex())
                        .maxMarks(q.getMaxMarks())
                        .modelAnswer(q.getModelAnswer())
                        .selectedOptionIndex(!isDr ? attempt.getUserAnswers().get(q.getId()) : null)
                        .studentAnswer(isDr ? attempt.getTextAnswers().get(q.getId()) : null)
                        .awardedMarks(awarded)
                        .isCorrect(!isDr && attempt.getUserAnswers().get(q.getId()) != null
                                && attempt.getUserAnswers().get(q.getId()).equals(q.getCorrectOptionIndex()))
                        .build());
            }
        }

        return SubmissionDetailResponse.builder()
                .attemptId(attempt.getId())
                .userId(user.getId())
                .studentName(user.getUsername())
                .quizTopic(quiz.getTopic())
                .quizCategory(quiz.getCategory())
                .objectiveScore(attempt.getScore())
                .totalMarks(attempt.getTotalMarks())
                .graded(attempt.isGraded())
                .questions(views)
                .build();
    }

    @Transactional
    public QuizAttempt gradeSubmission(Long attemptId, Map<Long, Integer> questionMarks) {
        SecurityUtils.validateAdmin();

        QuizAttempt attempt = quizAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found: " + attemptId));
        Quiz quiz = attempt.getQuiz();
        User user = attempt.getUser();

        int awardedTotal = 0;
        int objectiveScore = attempt.getScore() != null ? attempt.getScore() : 0;

        if (quiz.getQuestions() != null && questionMarks != null) {
            for (Question q : quiz.getQuestions()) {
                if (q.getQuestionType() != QuestionType.DESCRIPTIVE) continue;
                Integer marks = questionMarks.get(q.getId());
                int maxMarks = q.getMaxMarks() != null ? q.getMaxMarks() : 0;
                int bounded = Math.min(Math.max(marks != null ? marks : 0, 0), maxMarks);
                attempt.getQuestionMarks().put(q.getId(), bounded);
                awardedTotal += bounded;
            }
        }

        int totalMarks = objectiveScore + awardedTotal;
        int xpGained = totalMarks * 5;

        attempt.setTotalMarks(totalMarks);
        attempt.setGraded(true);
        attempt.setGradedAt(LocalDateTime.now());
        attempt.setStatus("COMPLETED");
        attempt.setXpGained(xpGained);

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

        return quizAttemptRepository.save(attempt);
    }
}