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

    // The admin who created this lecture
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private User admin;

    // Which course this lecture belongs to
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Full original URL stored for reference
    @Column(nullable = false)
    private String youtubeUrl;

    // Extracted 11-character YouTube video ID (e.g. "dQw4w9WgXcQ")
    // Used to build the embed URL: https://www.youtube.com/embed/{youtubeVideoId}
    @Column(nullable = false, length = 20)
    private String youtubeVideoId;

    // Position within the course — allows ordering lectures like a playlist
    @Builder.Default
    private Integer orderIndex = 0;

    // Admin can save as draft before publishing to students
    @Builder.Default
    private boolean published = true;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}