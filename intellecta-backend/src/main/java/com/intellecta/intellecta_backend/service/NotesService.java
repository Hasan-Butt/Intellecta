package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.dto.request.NoteRequest;
import com.intellecta.intellecta_backend.dto.response.NoteResponse;
import java.util.List;

public interface NotesService {
    NoteResponse createNote(Long userId, NoteRequest request);
    List<NoteResponse> getAllNotes(Long userId);
    NoteResponse getNoteById(Long userId, Long noteId);
    NoteResponse updateNote(Long userId, Long noteId, NoteRequest request);
    void deleteNote(Long userId, Long noteId);
    List<NoteResponse> searchNotes(Long userId, String q, String tag);
    NoteResponse flagForReview(Long userId, Long noteId);
    NoteResponse togglePin(Long userId, Long noteId);
    List<NoteResponse> getReviewQueue(Long userId);
}