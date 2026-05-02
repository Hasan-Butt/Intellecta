package com.intellecta.intellecta_backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.intellecta.intellecta_backend.dto.request.StudySessionRequest;
import com.intellecta.intellecta_backend.dto.response.StudySessionResponse;
import com.intellecta.intellecta_backend.service.StudySessionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class StudySessionController {

    private final StudySessionService sessionService;

     @PostMapping("/user/{userId}/start")
    public ResponseEntity<StudySessionResponse> start(
        @PathVariable Long userId,
        @RequestBody StudySessionRequest request
    ) {
        return ResponseEntity.ok(sessionService.startSession(userId, request));
    }

    @PatchMapping("/{sessionId}/end")
    public ResponseEntity<StudySessionResponse> end(@PathVariable Long sessionId) {
        return ResponseEntity.ok(sessionService.endSession(sessionId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<StudySessionResponse>> getAll(@PathVariable Long userId) {
        return ResponseEntity.ok(sessionService.getUserSessions(userId));
    }
}