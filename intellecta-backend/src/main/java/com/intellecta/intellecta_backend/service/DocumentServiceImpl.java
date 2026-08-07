package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.dto.request.DocumentTagRequest;
import com.intellecta.intellecta_backend.dto.response.DocumentResponse;
import com.intellecta.intellecta_backend.model.Document;
import com.intellecta.intellecta_backend.model.User;
import com.intellecta.intellecta_backend.repository.DocumentRepository;
import com.intellecta.intellecta_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentServiceImpl implements DocumentService {

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;

    // Files saved here on the server
    private final String UPLOAD_DIR = "uploads/";

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("pdf", "doc", "docx", "png", "jpg", "jpeg");
    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "image/png", "image/jpeg"
    );
    private static final long MAX_IMAGE_BYTES = 10 * 1024 * 1024;
    private static final long MAX_DOCUMENT_BYTES = 50 * 1024 * 1024;

    @Override
    public DocumentResponse uploadDocument(Long userId, MultipartFile file,
                                           String subject, String semester) throws IOException {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        String originalName = file.getOriginalFilename();
        String extension = originalName != null && originalName.contains(".")
                ? originalName.substring(originalName.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT)
                : "";

        validateUpload(file, originalName, extension);

        String fileType = mapFileType(extension);

        long maxBytes = "image".equals(fileType) ? MAX_IMAGE_BYTES : MAX_DOCUMENT_BYTES;
        if (file.getSize() > maxBytes) {
            throw new RuntimeException("File exceeds the maximum allowed size.");
        }

        // Sanitize subject: keep only alphanumerics, spaces, underscores, dashes -> no path traversal
        String safeSubject = sanitizePathSegment(subject);
        if (safeSubject.isEmpty()) {
            safeSubject = "General";
        }

        // Create directory if it doesn't exist: uploads/user_123/Physics/
        String dirPath = UPLOAD_DIR + "user_" + userId + "/" + safeSubject + "/";
        Path directory = Paths.get(dirPath);
        Files.createDirectories(directory);

        // Save file with a UUID-prefixed sanitized name -> no path traversal, no collisions
        String safeName = UUID.randomUUID() + "_" + sanitizeFileName(originalName);
        Path filePath = directory.resolve(safeName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        Document document = Document.builder()
            .fileName(originalName)
            .filePath(filePath.toString())
            .subject(subject)
            .semester(semester)
            .fileType(fileType)
            .fileSize(file.getSize())
            .tags("") // empty initially
            .user(user)
            .build();

        return toResponse(documentRepository.save(document));
    }

    private void validateUpload(MultipartFile file, String originalName, String extension) {
        if (file.isEmpty()) {
            throw new RuntimeException("Please select a file to upload.");
        }
        if (originalName == null || originalName.isBlank()) {
            throw new RuntimeException("File name is required.");
        }
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new RuntimeException("File type not allowed.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new RuntimeException("File type not allowed.");
        }
    }

    private String mapFileType(String extension) {
        if ("pdf".equals(extension)) return "pdf";
        if ("doc".equals(extension) || "docx".equals(extension)) return "doc";
        return "image";
    }

    private String sanitizeFileName(String name) {
        String cleaned = name.replaceAll("[^a-zA-Z0-9._-]", "_");
        while (cleaned.contains("..")) {
            cleaned = cleaned.replace("..", ".");
        }
        return cleaned;
    }

    private String sanitizePathSegment(String segment) {
        if (segment == null) return "";
        return segment.replaceAll("[^a-zA-Z0-9 _-]", "").trim();
    }

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

    @Override
    public void deleteDocument(Long userId, Long documentId) throws IOException {
        Document doc = findDocumentForUser(userId, documentId);
        // Delete from disk
        Path filePath = Paths.get(doc.getFilePath());
        Files.deleteIfExists(filePath);
        // Delete from DB
        documentRepository.delete(doc);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private Document findDocumentForUser(Long userId, Long documentId) {
        Document doc = documentRepository.findById(documentId)
            .orElseThrow(() -> new RuntimeException("Document not found"));
        if (!doc.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }
        return doc;
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
            .filePath(doc.getFilePath())
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