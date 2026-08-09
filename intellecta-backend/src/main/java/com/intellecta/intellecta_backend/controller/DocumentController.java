package com.intellecta.intellecta_backend.controller;

import com.intellecta.intellecta_backend.dto.request.DocumentTagRequest;
import com.intellecta.intellecta_backend.dto.response.DocumentResponse;
import com.intellecta.intellecta_backend.service.DocumentService;
import com.intellecta.intellecta_backend.security.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    /**
     * Register a document that was already uploaded to UploadThing by the frontend.
     * Replaces the old multipart POST /upload/user/{userId}.
     *
     * Body: {
     *   "fileUrl":   "https://utfs.io/f/...",
     *   "fileName":  "lecture-notes.pdf",
     *   "fileType":  "pdf",
     *   "fileSize":  204800,
     *   "subject":   "Physics",
     *   "semester":  "Semester 1"
     * }
     */
    @PostMapping("/register/user/{userId}")
    public ResponseEntity<DocumentResponse> registerDocument(
            @PathVariable Long userId,
            @RequestBody Map<String, Object> body) {
        SecurityUtils.validateUser(userId);

        String fileUrl  = (String) body.get("fileUrl");
        String fileName = (String) body.get("fileName");
        String fileType = (String) body.get("fileType");
        Number fileSize = (Number) body.get("fileSize");
        String subject  = (String) body.getOrDefault("subject", "General");
        String semester = (String) body.getOrDefault("semester", "Semester 1");

        return ResponseEntity.ok(documentService.registerDocument(
                userId, fileUrl, fileName, fileType,
                fileSize != null ? fileSize.longValue() : 0L,
                subject, semester));
    }

    // Get all documents for user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<DocumentResponse>> getAllDocuments(@PathVariable Long userId) {
        SecurityUtils.validateUser(userId);
        return ResponseEntity.ok(documentService.getAllDocuments(userId));
    }

    // Get documents filtered by subject
    @GetMapping("/user/{userId}/subject")
    public ResponseEntity<List<DocumentResponse>> getBySubject(
            @PathVariable Long userId,
            @RequestParam String subject) {
        SecurityUtils.validateUser(userId);
        return ResponseEntity.ok(documentService.getDocumentsBySubject(userId, subject));
    }

    // Search by filename or tag — optionally within a subject
    @GetMapping("/user/{userId}/search")
    public ResponseEntity<List<DocumentResponse>> search(
            @PathVariable Long userId,
            @RequestParam String q,
            @RequestParam(required = false) String subject) {
        SecurityUtils.validateUser(userId);
        return ResponseEntity.ok(documentService.searchDocuments(userId, q, subject));
    }

    // Update tags on a document
    @PutMapping("/user/{userId}/{documentId}/tags")
    public ResponseEntity<DocumentResponse> tagDocument(
            @PathVariable Long userId,
            @PathVariable Long documentId,
            @Valid @RequestBody DocumentTagRequest request) {
        SecurityUtils.validateUser(userId);
        return ResponseEntity.ok(documentService.tagDocument(userId, documentId, request));
    }

    // Delete a document
    @DeleteMapping("/user/{userId}/{documentId}")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable Long userId,
            @PathVariable Long documentId) {
        SecurityUtils.validateUser(userId);
        documentService.deleteDocument(userId, documentId);
        return ResponseEntity.noContent().build();
    }
}