package com.intellecta.intellecta_backend.controller;

import com.intellecta.intellecta_backend.dto.request.NoteRequest;
import com.intellecta.intellecta_backend.dto.response.NoteResponse;
import com.intellecta.intellecta_backend.service.NotesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
public class NotesController {

    private final NotesService notesService;

    @PostMapping("/user/{userId}")
    public ResponseEntity<NoteResponse> createNote(
            @PathVariable Long userId,
            @RequestBody NoteRequest request) {
        return ResponseEntity.ok(notesService.createNote(userId, request));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NoteResponse>> getAllNotes(@PathVariable Long userId) {
        return ResponseEntity.ok(notesService.getAllNotes(userId));
    }

    @GetMapping("/user/{userId}/{noteId}")
    public ResponseEntity<NoteResponse> getNoteById(
            @PathVariable Long userId,
            @PathVariable Long noteId) {
        return ResponseEntity.ok(notesService.getNoteById(userId, noteId));
    }

    @PutMapping("/user/{userId}/{noteId}")
    public ResponseEntity<NoteResponse> updateNote(
            @PathVariable Long userId,
            @PathVariable Long noteId,
            @RequestBody NoteRequest request) {
        return ResponseEntity.ok(notesService.updateNote(userId, noteId, request));
    }

    @DeleteMapping("/user/{userId}/{noteId}")
    public ResponseEntity<Void> deleteNote(
            @PathVariable Long userId,
            @PathVariable Long noteId) {
        notesService.deleteNote(userId, noteId);
        return ResponseEntity.noContent().build();
    }

    // ?q=keyword&tag=Physics — both optional, works independently or combined
    @GetMapping("/user/{userId}/search")
    public ResponseEntity<List<NoteResponse>> searchNotes(
            @PathVariable Long userId,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String tag) {
        return ResponseEntity.ok(notesService.searchNotes(userId, q, tag));
    }

    @PatchMapping("/user/{userId}/{noteId}/pin")
    public ResponseEntity<NoteResponse> togglePin(
            @PathVariable Long userId,
            @PathVariable Long noteId) {
        return ResponseEntity.ok(notesService.togglePin(userId, noteId));
    }

    @PatchMapping("/user/{userId}/{noteId}/review")
    public ResponseEntity<NoteResponse> flagForReview(
            @PathVariable Long userId,
            @PathVariable Long noteId) {
        return ResponseEntity.ok(notesService.flagForReview(userId, noteId));
    }

    @GetMapping("/user/{userId}/review-queue")
    public ResponseEntity<List<NoteResponse>> getReviewQueue(@PathVariable Long userId) {
        return ResponseEntity.ok(notesService.getReviewQueue(userId));
    }
}