package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.dto.request.DocumentTagRequest;
import com.intellecta.intellecta_backend.dto.response.DocumentResponse;
import com.intellecta.intellecta_backend.model.Document;
import com.intellecta.intellecta_backend.model.User;
import com.intellecta.intellecta_backend.repository.DocumentRepository;
import com.intellecta.intellecta_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentServiceImpl implements DocumentService {

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;

    // ── Register (UploadThing URL already obtained by frontend) ──────────────

    @Override
    public DocumentResponse registerDocument(Long userId, String fileUrl, String fileName,
                                              String fileType, Long fileSize,
                                              String subject, String semester) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (fileUrl == null || fileUrl.isBlank())
            throw new RuntimeException("fileUrl is required");
        if (fileName == null || fileName.isBlank())
            throw new RuntimeException("fileName is required");

        String resolvedFileType = fileType != null ? fileType : guessFileType(fileName);

        Document document = Document.builder()
            .fileName(fileName)
            .fileUrl(fileUrl)
            .subject(subject != null ? subject : "General")
            .semester(semester != null ? semester : "Semester 1")
            .fileType(resolvedFileType)
            .fileSize(fileSize != null ? fileSize : 0L)
            .tags("")
            .user(user)
            .build();

        return toResponse(documentRepository.save(document));
    }

    // ── Read ─────────────────────────────────────────────────────────────────

    @Override
    public List<DocumentResponse> getAllDocuments(Long userId) {
        return documentRepository.findByUserIdOrderByUploadDateDesc(userId)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<DocumentResponse> getDocumentsBySubject(Long userId, String subject) {
        return documentRepository.findByUserIdAndSubjectOrderByUploadDateDesc(userId, subject)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public DocumentResponse tagDocument(Long userId, Long documentId, DocumentTagRequest request) {
        Document doc = findDocumentForUser(userId, documentId);
        doc.setTags(tagsToString(request.getTags()));
        return toResponse(documentRepository.save(doc));
    }

    @Override
    public List<DocumentResponse> searchDocuments(Long userId, String q, String subject) {
        if (subject != null && !subject.isBlank()) {
            return documentRepository.searchByNameOrTagInSubject(userId, subject, q)
                .stream().map(this::toResponse).collect(Collectors.toList());
        }
        return documentRepository.searchByNameOrTag(userId, q)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ── Delete ───────────────────────────────────────────────────────────────

    @Override
    public void deleteDocument(Long userId, Long documentId) {
        Document doc = findDocumentForUser(userId, documentId);
        // File lives on UploadThing CDN — no local disk cleanup needed.
        documentRepository.delete(doc);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private Document findDocumentForUser(Long userId, Long documentId) {
        Document doc = documentRepository.findById(documentId)
            .orElseThrow(() -> new RuntimeException("Document not found"));
        if (!doc.getUser().getId().equals(userId))
            throw new RuntimeException("Access denied");
        return doc;
    }

    private String guessFileType(String fileName) {
        String lower = fileName.toLowerCase();
        if (lower.endsWith(".pdf"))  return "pdf";
        if (lower.endsWith(".doc") || lower.endsWith(".docx")) return "doc";
        if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image";
        return "file";
    }

    private String tagsToString(List<String> tags) {
        if (tags == null || tags.isEmpty()) return "";
        return String.join(",", tags);
    }

    private List<String> stringToTags(String tags) {
        if (tags == null || tags.isBlank()) return Collections.emptyList();
        return Arrays.asList(tags.split(","));
    }

    private DocumentResponse toResponse(Document doc) {
        return DocumentResponse.builder()
            .id(doc.getId())
            .fileName(doc.getFileName())
            .fileUrl(doc.getFileUrl())
            .subject(doc.getSubject())
            .semester(doc.getSemester())
            .category(doc.getCategory())
            .tags(stringToTags(doc.getTags()))
            .fileType(doc.getFileType())
            .fileSize(doc.getFileSize())
            .uploadDate(doc.getUploadDate())
            .build();
    }
}