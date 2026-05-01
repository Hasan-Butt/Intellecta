package com.intellecta.intellecta_backend.controller;

import com.intellecta.intellecta_backend.dto.request.ExamRequest;
import com.intellecta.intellecta_backend.dto.response.ExamResponse;
import com.intellecta.intellecta_backend.service.ExamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/exams")
@RequiredArgsConstructor
public class ExamController {

    private final ExamService examService;

    @PostMapping
    public ResponseEntity<ExamResponse> createExam(@RequestBody ExamRequest request) {
        return ResponseEntity.ok(examService.createExam(request));
    }

    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<List<ExamResponse>> getExamsBySubject(@PathVariable Long subjectId) {
        return ResponseEntity.ok(examService.getExamsBySubject(subjectId));
    }

    @PutMapping("/{examId}/date")
    public ResponseEntity<ExamResponse> updateDate(
            @PathVariable Long examId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(examService.updateExamDate(examId, body.get("examDate")));
    }

    @DeleteMapping("/{examId}")
    public ResponseEntity<Void> deleteExam(@PathVariable Long examId) {
        examService.deleteExam(examId);
        return ResponseEntity.noContent().build();
    }
}