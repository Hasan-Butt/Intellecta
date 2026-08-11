package com.intellecta.intellecta_backend.controller;

import com.intellecta.intellecta_backend.dto.request.QuizSubmissionRequest;
import com.intellecta.intellecta_backend.dto.response.SubmissionDetailResponse;
import com.intellecta.intellecta_backend.model.Quiz;
import com.intellecta.intellecta_backend.model.QuizAttempt;
import com.intellecta.intellecta_backend.repository.QuizAttemptRepository;
import com.intellecta.intellecta_backend.service.QuizGradingService;
import com.intellecta.intellecta_backend.service.QuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.intellecta.intellecta_backend.security.SecurityUtils;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
public class QuizController {
    
    private final QuizService quizService;
    private final QuizGradingService quizGradingService;
    private final QuizAttemptRepository quizAttemptRepository;

    @GetMapping
    public ResponseEntity<List<Quiz>> getAllQuizzes(@RequestParam(required = false) Long userId) {
        if (userId != null) {
            SecurityUtils.validateUser(userId);
        }
        return ResponseEntity.ok(quizService.getAllQuizzes(userId));
    }

    @PostMapping
    public ResponseEntity<Quiz> createQuiz(@RequestBody Quiz quiz) {
        return ResponseEntity.ok(quizService.createQuiz(quiz));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Quiz> getQuizById(@PathVariable Long id,
                                            @RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(quizService.getQuizById(id, userId));
    }

    @PostMapping("/submit")
    public ResponseEntity<QuizAttempt> submitQuiz(@Valid @RequestBody QuizSubmissionRequest request) {
        if (request != null && request.getUserId() != null) {
            SecurityUtils.validateUser(request.getUserId());
        }
        System.out.println("Received quiz submission request for quizId: " + request.getQuizId());
        return ResponseEntity.ok(quizService.submitQuiz(request));
    }
    @GetMapping("/attempts/user/{userId}")
    public ResponseEntity<List<QuizAttempt>> getAttemptsByUserId(@PathVariable Long userId) {
        SecurityUtils.validateUser(userId);
        return ResponseEntity.ok(quizService.getAttemptsByUserId(userId));
    }

    @GetMapping("/submissions/{attemptId}")
    public ResponseEntity<SubmissionDetailResponse> getSubmissionForStudent(@PathVariable Long attemptId) {
        QuizAttempt attempt = quizAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found: " + attemptId));
        if (attempt.getUser() != null) {
            SecurityUtils.validateUser(attempt.getUser().getId());
        }
        SubmissionDetailResponse detail = quizGradingService.getSubmissionDetail(attemptId);
        if (!detail.isGraded()) {
            detail.getQuestions().forEach(q -> {
                q.setCorrectOptionIndex(null);
                q.setModelAnswer(null);
                q.setAwardedMarks(null);
                q.setIsCorrect(null);
                q.setMaxMarks(null);
            });
        }
        return ResponseEntity.ok(detail);
    }
}