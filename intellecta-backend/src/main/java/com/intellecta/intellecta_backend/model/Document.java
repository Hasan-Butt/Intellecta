package com.intellecta.intellecta_backend.model;

import com.intellecta.intellecta_backend.enums.DocumentCategory;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fileName;

    // Path on disk where file is stored e.g. uploads/user_1/physics/file.pdf
    @Column(nullable = false)
    private String filePath;

    // Subject name e.g. "Physics", "Mathematics"
    private String subject;

    // Semester name e.g. "Semester 1"
    private String semester;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "VARCHAR(50)")
    private DocumentCategory category;

    // Comma-separated tags e.g. "Physics,Quantum,Exam"
    @Column(name = "tags", columnDefinition = "VARCHAR(500)")
    private String tags;

    private String fileType; // "pdf", "doc", "image"

    private Long fileSize; // in bytes

    @Column(nullable = false, updatable = false)
    private LocalDateTime uploadDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @PrePersist
    protected void onUpload() {
        uploadDate = LocalDateTime.now();
    }
}