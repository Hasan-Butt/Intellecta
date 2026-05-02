package com.intellecta.intellecta_backend.controller;

import com.intellecta.intellecta_backend.dto.request.QuizSubmissionRequest;
import com.intellecta.intellecta_backend.model.Quiz;
import com.intellecta.intellecta_backend.model.QuizAttempt;
import com.intellecta.intellecta_backend.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class QuizController {
    
    private final QuizService quizService;

    @GetMapping
    public ResponseEntity<List<Quiz>> getAllQuizzes() {
        return ResponseEntity.ok(quizService.getAllQuizzes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Quiz> getQuizById(@PathVariable Long id) {
        return ResponseEntity.ok(quizService.getQuizById(id));
    }

    @PostMapping("/submit")
    public ResponseEntity<QuizAttempt> submitQuiz(@RequestBody QuizSubmissionRequest request) {
        System.out.println("Received quiz submission request for quizId: " + request.getQuizId());
        return ResponseEntity.ok(quizService.submitQuiz(request));
    }
}