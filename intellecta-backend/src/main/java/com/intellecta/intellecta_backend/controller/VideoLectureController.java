package com.intellecta.intellecta_backend.controller;

import com.intellecta.intellecta_backend.dto.request.VideoLectureRequest;
import com.intellecta.intellecta_backend.dto.response.VideoLectureResponse;
import com.intellecta.intellecta_backend.service.VideoLectureService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class VideoLectureController {

    private final VideoLectureService videoLectureService;

    // ---------------------------------------------------------------
    // ADMIN ENDPOINTS — all under /api/admin/lectures
    // Covered by existing SecurityConfig: .requestMatchers("/api/admin/**").hasRole("ADMIN")
    // ---------------------------------------------------------------

    @PostMapping("/api/admin/lectures")
    public ResponseEntity<VideoLectureResponse> createLecture(
            @Valid @RequestBody VideoLectureRequest request,
            Principal principal) {
        // principal.getName() returns the authenticated admin's email (set by JwtAuthFilter)
        return ResponseEntity.ok(videoLectureService.createLecture(request, principal.getName()));
    }

    @PutMapping("/api/admin/lectures/{id}")
    public ResponseEntity<VideoLectureResponse> updateLecture(
            @PathVariable Long id,
            @Valid @RequestBody VideoLectureRequest request) {
        return ResponseEntity.ok(videoLectureService.updateLecture(id, request));
    }

    @DeleteMapping("/api/admin/lectures/{id}")
    public ResponseEntity<Void> deleteLecture(@PathVariable Long id) {
        videoLectureService.deleteLecture(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/api/admin/lectures/{id}/toggle-publish")
    public ResponseEntity<VideoLectureResponse> togglePublish(@PathVariable Long id) {
        return ResponseEntity.ok(videoLectureService.togglePublished(id));
    }

    // Admin: see all lectures for a course (including unpublished drafts)
    @GetMapping("/api/admin/lectures/course/{courseId}")
    public ResponseEntity<List<VideoLectureResponse>> getLecturesForCourseAdmin(
            @PathVariable Long courseId) {
        return ResponseEntity.ok(videoLectureService.getLecturesByCourseAdmin(courseId));
    }

    // ---------------------------------------------------------------
    // STUDENT ENDPOINTS — under /api/lectures
    // Covered by: .requestMatchers("/api/**").authenticated()
    // ---------------------------------------------------------------

    // Student: only published lectures for a course
    @GetMapping("/api/lectures/course/{courseId}")
    public ResponseEntity<List<VideoLectureResponse>> getLecturesForCourseStudent(
            @PathVariable Long courseId) {
        return ResponseEntity.ok(videoLectureService.getLecturesByCourseStudent(courseId));
    }

    // Both roles: get a single lecture by ID (for the player page)
    @GetMapping("/api/lectures/{id}")
    public ResponseEntity<VideoLectureResponse> getLectureById(@PathVariable Long id) {
        return ResponseEntity.ok(videoLectureService.getLectureById(id));
    }
}