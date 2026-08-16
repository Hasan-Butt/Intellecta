package com.intellecta.intellecta_backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Tracks how far a student has watched a specific lecture.
 * Unique per (user, lecture) pair — upserted on every progress update.
 */
@Entity
@Table(
    name = "lecture_progress",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_lecture_progress_user_lecture",
        columnNames = {"user_id", "lecture_id"}
    )
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LectureProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lecture_id", nullable = false)
    private VideoLecture lecture;

    /** Watch percentage 0-100. */
    @Column(nullable = false)
    private int progressPct;

    /** True when progressPct >= 90. */
    @Column(nullable = false)
    @Builder.Default
    private boolean completed = false;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
