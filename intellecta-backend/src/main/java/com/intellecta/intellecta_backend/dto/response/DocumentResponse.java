package com.intellecta.intellecta_backend.dto.response;

import com.intellecta.intellecta_backend.enums.DocumentCategory;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder
public class DocumentResponse {
    private Long id;
    private String fileName;
    private String filePath;
    private String subject;
    private String semester;
    private DocumentCategory category;
    private List<String> tags;
    private String fileType;
    private Long fileSize;
    private LocalDateTime uploadDate;
}