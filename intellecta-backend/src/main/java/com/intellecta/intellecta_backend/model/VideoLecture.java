package com.intellecta.intellecta_backend.model;

import com.intellecta.intellecta_backend.dto.ResourceLinkDto;
import com.intellecta.intellecta_backend.util.ResourceLinkConverter;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

    @Column(columnDefinition = "NVARCHAR(MAX)")
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

    // Resource links stored as a JSON array of {label, url} objects
    @Convert(converter = ResourceLinkConverter.class)
    @Column(name = "resource_links", columnDefinition = "NVARCHAR(MAX)")
    @Builder.Default
    private List<ResourceLinkDto> resourceLinks = new ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}