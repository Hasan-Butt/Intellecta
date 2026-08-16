package com.intellecta.intellecta_backend.controller;

import com.intellecta.intellecta_backend.dto.request.VideoLectureRequest;
import com.intellecta.intellecta_backend.dto.response.VideoLectureResponse;
import com.intellecta.intellecta_backend.service.LectureProgressService;
import com.intellecta.intellecta_backend.service.VideoLectureService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class VideoLectureController {

    private final VideoLectureService videoLectureService;
    private final LectureProgressService lectureProgressService;

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

    // ---------------------------------------------------------------
    // STUDENT — Watch Progress
    // ---------------------------------------------------------------

    /**
     * Upsert watch progress for the calling user on a specific lecture.
     * Body: { "progressPct": 45 }
     * The service only writes if pct is strictly greater than the stored value.
     */
    @PostMapping("/api/lectures/{id}/progress")
    public ResponseEntity<Void> saveProgress(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> body,
            Principal principal) {
        int pct = body.getOrDefault("progressPct", 0);
        lectureProgressService.upsertProgress(id, pct, principal.getName());
        return ResponseEntity.ok().build();
    }

    /**
     * Returns a map of lectureId → progressPct for all lectures the current
     * user has started. Used to hydrate client-side progress state on load.
     */
    @GetMapping("/api/lectures/progress")
    public ResponseEntity<Map<Long, Integer>> getProgressMap(Principal principal) {
        return ResponseEntity.ok(lectureProgressService.getProgressMap(principal.getName()));
    }
}