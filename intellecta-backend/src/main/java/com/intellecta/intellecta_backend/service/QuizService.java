package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.dto.request.QuizSubmissionRequest;
import com.intellecta.intellecta_backend.model.Question;
import com.intellecta.intellecta_backend.model.Quiz;
import com.intellecta.intellecta_backend.model.QuizAttempt;
import com.intellecta.intellecta_backend.model.User;
import com.intellecta.intellecta_backend.repository.QuizAttemptRepository;
import com.intellecta.intellecta_backend.repository.QuizRepository;
import com.intellecta.intellecta_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final UserRepository userRepository;

    public List<Quiz> getAllQuizzes() {
        return quizRepository.findAll();
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
        try {
            Quiz quiz = getQuizById(request.getQuizId());
            User user = userRepository.findById(request.getUserId()).orElseGet(() -> {
                System.out.println("Warning: User ID " + request.getUserId()
                        + " not found. Falling back to the first available user.");
                return userRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new RuntimeException("No users found in the database."));
            });

            int score = 0;
            List<Question> questions = quiz.getQuestions();
            Map<Long, Integer> userAnswers = request.getAnswers();

            System.out.println("Processing submission for quiz: " + quiz.getTitle() + " (Questions: "
                    + (questions != null ? questions.size() : 0) + ")");

            if (userAnswers != null && questions != null) {
                for (Question q : questions) {
                    Integer userSelection = userAnswers.get(q.getId());
                    if (userSelection != null && userSelection.equals(q.getCorrectOptionIndex())) {
                        score++;
                    }
                }
            }

            QuizAttempt attempt = QuizAttempt.builder()
                    .user(user)
                    .quiz(quiz)
                    .score(score)
                    .totalQuestions(questions != null ? questions.size() : 0)
                    .userAnswers(userAnswers)
                    .startTime(LocalDateTime.now().minusMinutes(quiz.getTimeLimit()))
                    .endTime(LocalDateTime.now())
                    .status("COMPLETED")
                    .build();

            QuizAttempt saved = quizAttemptRepository.save(attempt);
            System.out.println("Quiz submitted successfully. Score: " + score + "/" + attempt.getTotalQuestions());
            return saved;
        } catch (Exception e) {
            System.err.println("CRITICAL ERROR IN QUIZ SUBMISSION: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

}
