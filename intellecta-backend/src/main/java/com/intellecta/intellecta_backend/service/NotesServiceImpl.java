package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.dto.request.NoteRequest;
import com.intellecta.intellecta_backend.dto.response.NoteResponse;
import com.intellecta.intellecta_backend.model.Notes;
import com.intellecta.intellecta_backend.model.User;
import com.intellecta.intellecta_backend.repository.NotesRepository;
import com.intellecta.intellecta_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotesServiceImpl implements NotesService {

    private final NotesRepository notesRepository;
    private final UserRepository userRepository;

    @Override
    public NoteResponse createNote(Long userId, NoteRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        Notes note = Notes.builder()
            .title(request.getTitle())
            .content(request.getContent())
            .category(request.getCategory())
            .source(request.getSource())
            .isPinned(request.isPinned())
            .isSpecial(request.isSpecial())
            .flaggedForReview(request.isFlaggedForReview())
            .tags(tagsToString(request.getTags()))
            .user(user)
            .build();

        return toResponse(notesRepository.save(note));
    }

    @Override
    public List<NoteResponse> getAllNotes(Long userId) {
        return notesRepository
            .findByUserIdOrderByIsPinnedDescCreatedAtDesc(userId)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public NoteResponse getNoteById(Long userId, Long noteId) {
        return toResponse(findNoteForUser(userId, noteId));
    }

    @Override
    public NoteResponse updateNote(Long userId, Long noteId, NoteRequest request) {
        Notes note = findNoteForUser(userId, noteId);
        note.setTitle(request.getTitle());
        note.setContent(request.getContent());
        note.setCategory(request.getCategory());
        note.setSource(request.getSource());
        note.setPinned(request.isPinned());
        note.setSpecial(request.isSpecial());
        note.setFlaggedForReview(request.isFlaggedForReview());
        note.setTags(tagsToString(request.getTags()));
        return toResponse(notesRepository.save(note));
    }

    @Override
    public void deleteNote(Long userId, Long noteId) {
        notesRepository.delete(findNoteForUser(userId, noteId));
    }

    @Override
    public List<NoteResponse> searchNotes(Long userId, String q, String tag) {
        // Both provided — use combined query
        if (q != null && !q.isBlank() && tag != null && !tag.isBlank()) {
            return notesRepository.searchByKeywordAndTag(userId, q, tag)
                .stream().map(this::toResponse).collect(Collectors.toList());
        }
        // Keyword only
        if (q != null && !q.isBlank()) {
            return notesRepository.searchByKeyword(userId, q)
                .stream().map(this::toResponse).collect(Collectors.toList());
        }
        // Tag only
        if (tag != null && !tag.isBlank()) {
            return notesRepository.findByTag(userId, tag)
                .stream().map(this::toResponse).collect(Collectors.toList());
        }
        // Nothing provided — return all
        return getAllNotes(userId);
    }

    @Override
    public NoteResponse flagForReview(Long userId, Long noteId) {
        Notes note = findNoteForUser(userId, noteId);
        note.setFlaggedForReview(!note.isFlaggedForReview()); // toggles
        return toResponse(notesRepository.save(note));
    }

    @Override
    public NoteResponse togglePin(Long userId, Long noteId) {
        Notes note = findNoteForUser(userId, noteId);
        note.setPinned(!note.isPinned());
        return toResponse(notesRepository.save(note));
    }

    @Override
    public List<NoteResponse> getReviewQueue(Long userId) {
        return notesRepository.findByUserIdAndFlaggedForReviewTrue(userId)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private Notes findNoteForUser(Long userId, Long noteId) {
        Notes note = notesRepository.findById(noteId)
            .orElseThrow(() -> new RuntimeException("Note not found"));
        if (!note.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }
        return note;
    }

    private String tagsToString(List<String> tags) {
        if (tags == null || tags.isEmpty()) return "";
        return String.join(",", tags);
    }

    private List<String> stringToTags(String tags) {
        if (tags == null || tags.isBlank()) return Collections.emptyList();
        return Arrays.asList(tags.split(","));
    }

    private NoteResponse toResponse(Notes note) {
        return NoteResponse.builder()
            .id(note.getId())
            .title(note.getTitle())
            .content(note.getContent())
            .category(note.getCategory())
            .source(note.getSource())
            .isPinned(note.isPinned())
            .isSpecial(note.isSpecial())
            .flaggedForReview(note.isFlaggedForReview())
            .tags(stringToTags(note.getTags()))
            .createdAt(note.getCreatedAt())
            .updatedAt(note.getUpdatedAt())
            .build();
    }
}