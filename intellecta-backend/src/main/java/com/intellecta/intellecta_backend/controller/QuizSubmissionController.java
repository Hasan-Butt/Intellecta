package com.intellecta.intellecta_backend.controller;

import com.intellecta.intellecta_backend.dto.request.GradeSubmissionRequest;
import com.intellecta.intellecta_backend.dto.response.SubmissionDetailResponse;
import com.intellecta.intellecta_backend.model.QuizAttempt;
import com.intellecta.intellecta_backend.service.QuizGradingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/quiz-submissions")
@RequiredArgsConstructor
public class QuizSubmissionController {

    private final QuizGradingService quizGradingService;

    @GetMapping
    public ResponseEntity<List<QuizAttempt>> getPendingSubmissions() {
        return ResponseEntity.ok(quizGradingService.getPendingSubmissions());
    }

    @GetMapping("/{attemptId}")
    public ResponseEntity<SubmissionDetailResponse> getSubmissionDetail(@PathVariable Long attemptId) {
        return ResponseEntity.ok(quizGradingService.getSubmissionDetail(attemptId));
    }

    @PostMapping("/{attemptId}/grade")
    public ResponseEntity<QuizAttempt> gradeSubmission(@PathVariable Long attemptId,
                                                       @RequestBody GradeSubmissionRequest request) {
        return ResponseEntity.ok(quizGradingService.gradeSubmission(attemptId, request.getQuestionMarks()));
    }
}