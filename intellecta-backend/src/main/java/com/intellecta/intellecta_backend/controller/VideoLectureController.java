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
    // ADMIN — /api/admin/lectures
    // Covered by existing SecurityConfig: /api/admin/** → hasRole("ADMIN")
    // ---------------------------------------------------------------

    @PostMapping("/api/admin/lectures")
    public ResponseEntity<VideoLectureResponse> createLecture(
            @Valid @RequestBody VideoLectureRequest request,
            Principal principal) {
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

    // Admin: all lectures including drafts
    @GetMapping("/api/admin/lectures")
    public ResponseEntity<List<VideoLectureResponse>> getAllLecturesAdmin() {
        return ResponseEntity.ok(videoLectureService.getAllLecturesAdmin());
    }

    // ---------------------------------------------------------------
    // STUDENT — /api/lectures
    // Covered by: /api/** → authenticated()
    // ---------------------------------------------------------------

    // Student: published lectures only
    @GetMapping("/api/lectures")
    public ResponseEntity<List<VideoLectureResponse>> getAllLecturesStudent() {
        return ResponseEntity.ok(videoLectureService.getAllLecturesStudent());
    }

    // Both roles: single lecture by ID (for player page deeplink)
    @GetMapping("/api/lectures/{id}")
    public ResponseEntity<VideoLectureResponse> getLectureById(@PathVariable Long id) {
        return ResponseEntity.ok(videoLectureService.getLectureById(id));
    }
}