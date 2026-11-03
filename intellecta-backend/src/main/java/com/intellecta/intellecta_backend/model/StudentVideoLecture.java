package com.intellecta.intellecta_backend.model;

import com.intellecta.intellecta_backend.dto.ResourceLinkDto;
import com.intellecta.intellecta_backend.util.ResourceLinkConverter;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * A student's personally added YouTube lecture.
 * Visible only to the student who created it (not all students).
 */
@Entity
@Table(name = "student_video_lectures")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StudentVideoLecture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The student who added this lecture */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String youtubeUrl;

    /** Extracted 11-char YouTube video ID */
    @Column(nullable = false, length = 20)
    private String youtubeVideoId;

    /** Optional plain-text label e.g. "DSA", "OOP" */
    private String topic;

    @Builder.Default
    private Integer orderIndex = 0;

    /** Watch percentage 0-100 */
    @Column(name = "progress_pct", nullable = false)
    @Builder.Default
    private int progressPct = 0;

    /** True when progressPct >= 90 */
    @Column(nullable = false)
    @Builder.Default
    private boolean completed = false;

    /** Resource links stored as JSON array of {label, url} */
    @Convert(converter = ResourceLinkConverter.class)
    @Column(name = "resource_links", columnDefinition = "TEXT")
    @Builder.Default
    private List<ResourceLinkDto> resourceLinks = new ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}

