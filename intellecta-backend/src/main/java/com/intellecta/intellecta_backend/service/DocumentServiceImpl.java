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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentServiceImpl implements DocumentService {

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;

    // Files saved here on the server
    private final String UPLOAD_DIR = "uploads/";

    @Override
    public DocumentResponse uploadDocument(Long userId, MultipartFile file,
                                           String subject, String semester) throws IOException {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Create directory if it doesn't exist: uploads/user_1/Physics/
        String dirPath = UPLOAD_DIR + "user_" + userId + "/" + subject + "/";
        Path directory = Paths.get(dirPath);
        Files.createDirectories(directory);

        // Save file to disk
        String originalName = file.getOriginalFilename();
        Path filePath = directory.resolve(originalName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Determine file type from extension
        String fileType = "file";
        if (originalName != null) {
            if (originalName.endsWith(".pdf")) fileType = "pdf";
            else if (originalName.matches(".*\\.(doc|docx)$")) fileType = "doc";
            else if (originalName.matches(".*\\.(png|jpg|jpeg)$")) fileType = "image";
        }

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