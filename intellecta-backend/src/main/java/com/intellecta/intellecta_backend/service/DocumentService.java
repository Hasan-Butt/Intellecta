package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.dto.request.DocumentTagRequest;
import com.intellecta.intellecta_backend.dto.response.DocumentResponse;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

public interface DocumentService {
    DocumentResponse uploadDocument(Long userId, MultipartFile file, String subject, String semester) throws IOException;
    List<DocumentResponse> getAllDocuments(Long userId);
    List<DocumentResponse> getDocumentsBySubject(Long userId, String subject);
    DocumentResponse tagDocument(Long userId, Long documentId, DocumentTagRequest request);
    List<DocumentResponse> searchDocuments(Long userId, String q, String subject);
    void deleteDocument(Long userId, Long documentId) throws IOException;
}