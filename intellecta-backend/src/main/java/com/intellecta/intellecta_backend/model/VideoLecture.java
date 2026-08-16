package com.intellecta.intellecta_backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "video_lectures")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VideoLecture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Admin who created this lecture
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private User admin;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String youtubeUrl;

    // Extracted 11-char YouTube video ID, used for embed + thumbnail
    @Column(nullable = false, length = 20)
    private String youtubeVideoId;

    // Optional plain-text label: "DSA", "OOP", "Networking" — no FK
    private String topic;

    @Builder.Default
    private Integer orderIndex = 0;

    @Builder.Default
    private boolean published = true;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}