package com.intellecta.intellecta_backend.model;

import com.intellecta.intellecta_backend.enums.NoteCategory;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Notes {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "VARCHAR(50)")
    private NoteCategory category;

    private String source;

    // Comma-separated: "Mastery,Physics,Exam"
    @Column(name = "tags", columnDefinition = "VARCHAR(500)")
    private String tags;

    private boolean isPinned = false;
    private boolean isSpecial = false;
    private boolean flaggedForReview = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}