package com.intellecta.intellecta_backend.controller;

import com.intellecta.intellecta_backend.dto.request.VideoLectureRequest;
import com.intellecta.intellecta_backend.dto.response.StudentVideoLectureResponse;
import com.intellecta.intellecta_backend.service.StudentVideoLectureService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

/**
 * REST controller for student-owned YouTube lectures.
 *
 * All routes live under /api/lectures/my/* so they are covered by the
 * existing security rule:  /api/** → authenticated()
 *
 * Every mutation endpoint validates ownership inside the service, so
 * students can only read/edit/delete their own lectures.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/lectures/my")
public class StudentVideoLectureController {

    private final StudentVideoLectureService studentLectureService;

    /** GET /api/lectures/my — list this student's own lectures */
    @GetMapping
    public ResponseEntity<List<StudentVideoLectureResponse>> getMyLectures(Principal principal) {
        return ResponseEntity.ok(studentLectureService.getMyLectures(principal.getName()));
    }

    /** POST /api/lectures/my — add a new personal lecture */
    @PostMapping
    public ResponseEntity<StudentVideoLectureResponse> createLecture(
            @Valid @RequestBody VideoLectureRequest request,
            Principal principal) {
        return ResponseEntity.ok(studentLectureService.createLecture(request, principal.getName()));
    }

    /** PUT /api/lectures/my/{id} — update own lecture */
    @PutMapping("/{id}")
    public ResponseEntity<StudentVideoLectureResponse> updateLecture(
            @PathVariable Long id,
            @Valid @RequestBody VideoLectureRequest request,
            Principal principal) {
        return ResponseEntity.ok(studentLectureService.updateLecture(id, request, principal.getName()));
    }

    /** DELETE /api/lectures/my/{id} — delete own lecture */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLecture(
            @PathVariable Long id,
            Principal principal) {
        studentLectureService.deleteLecture(id, principal.getName());
        return ResponseEntity.noContent().build();
    }

    /** POST /api/lectures/my/{id}/progress — update watch progress on own lecture */
    @PostMapping("/{id}/progress")
    public ResponseEntity<Void> saveProgress(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> body,
            Principal principal) {
        int pct = body.getOrDefault("progressPct", 0);
        studentLectureService.updateProgress(id, pct, principal.getName());
        return ResponseEntity.ok().build();
    }

    /** GET /api/lectures/my/progress — get progress map for own lectures */
    @GetMapping("/progress")
    public ResponseEntity<Map<Long, Integer>> getProgressMap(Principal principal) {
        return ResponseEntity.ok(studentLectureService.getProgressMap(principal.getName()));
    }
} 
