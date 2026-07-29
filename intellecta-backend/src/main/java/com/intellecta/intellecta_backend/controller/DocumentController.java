package com.intellecta.intellecta_backend.controller;

import com.intellecta.intellecta_backend.dto.request.DocumentTagRequest;
import com.intellecta.intellecta_backend.dto.response.DocumentResponse;
import com.intellecta.intellecta_backend.service.DocumentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

import com.intellecta.intellecta_backend.security.SecurityUtils;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    // Upload a file — multipart form data
    @PostMapping("/upload/user/{userId}")
    public ResponseEntity<DocumentResponse> uploadDocument(
            @PathVariable Long userId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("subject") String subject,
            @RequestParam(value = "semester", defaultValue = "Semester 1") String semester)
            throws IOException {
        SecurityUtils.validateUser(userId);
        return ResponseEntity.ok(documentService.uploadDocument(userId, file, subject, semester));
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
            @PathVariable Long documentId) throws IOException {
        SecurityUtils.validateUser(userId);
        documentService.deleteDocument(userId, documentId);
        return ResponseEntity.noContent().build();
    }
}