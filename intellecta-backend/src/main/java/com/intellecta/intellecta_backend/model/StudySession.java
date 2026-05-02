package com.intellecta.intellecta_backend.model;

import java.time.Duration;
import java.time.LocalDateTime;

import org.hibernate.annotations.ColumnDefault;

import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "study_sessions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StudySession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String subject;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    @Column(nullable = false)
    @ColumnDefault ("0")
    @Builder.Default
    private int pomodorosCompleted = 0;

    @Column(nullable = false)
    @ColumnDefault("0")
    @Builder.Default
    private boolean deepWork = false;

    // ── Derived helper (not persisted) ────────────────────────────────────────
    @Transient
    public long getDurationMinutes() {
        if (startTime == null || endTime == null) return 0;
        return Duration.between(startTime, endTime).toMinutes();
    }
}
