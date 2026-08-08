package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.dto.request.DocumentTagRequest;
import com.intellecta.intellecta_backend.dto.response.DocumentResponse;
import java.util.List;

public interface DocumentService {
    /** Register a document whose file is already uploaded to UploadThing. */
    DocumentResponse registerDocument(Long userId, String fileUrl, String fileName,
                                      String fileType, Long fileSize,
                                      String subject, String semester);
    List<DocumentResponse> getAllDocuments(Long userId);
    List<DocumentResponse> getDocumentsBySubject(Long userId, String subject);
    DocumentResponse tagDocument(Long userId, Long documentId, DocumentTagRequest request);
    List<DocumentResponse> searchDocuments(Long userId, String q, String subject);
    void deleteDocument(Long userId, Long documentId);
}