package com.intellecta.intellecta_backend.controller;

import com.intellecta.intellecta_backend.dto.request.SubjectRequest;
import com.intellecta.intellecta_backend.dto.response.SubjectResponse;
import com.intellecta.intellecta_backend.service.SubjectService;
import com.intellecta.intellecta_backend.security.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/subjects")
@RequiredArgsConstructor
public class SubjectController {

    private final SubjectService subjectService;

    @PostMapping("/user/{userId}")
    public ResponseEntity<SubjectResponse> createSubject(
            @PathVariable Long userId,
            @Valid @RequestBody SubjectRequest request) {
        SecurityUtils.validateUser(userId);
        return ResponseEntity.ok(subjectService.createSubject(userId, request));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SubjectResponse>> getAllSubjects(@PathVariable Long userId) {
        SecurityUtils.validateUser(userId);
        return ResponseEntity.ok(subjectService.getAllSubjects(userId));
    }

    @DeleteMapping("/user/{userId}/{subjectId}")
    public ResponseEntity<Void> deleteSubject(
            @PathVariable Long userId,
            @PathVariable Long subjectId) {
        SecurityUtils.validateUser(userId);
        subjectService.deleteSubject(userId, subjectId);
        return ResponseEntity.noContent().build();
    }
}