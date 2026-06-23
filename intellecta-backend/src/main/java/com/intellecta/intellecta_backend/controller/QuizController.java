package com.intellecta.intellecta_backend.controller;

import com.intellecta.intellecta_backend.dto.request.QuizSubmissionRequest;
import com.intellecta.intellecta_backend.model.Quiz;
import com.intellecta.intellecta_backend.model.QuizAttempt;
import com.intellecta.intellecta_backend.service.QuizService;
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
    public ResponseEntity<Quiz> getQuizById(@PathVariable Long id) {
        return ResponseEntity.ok(quizService.getQuizById(id));
    }

    @PostMapping("/submit")
    public ResponseEntity<QuizAttempt> submitQuiz(@RequestBody QuizSubmissionRequest request) {
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
}