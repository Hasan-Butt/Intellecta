package com.intellecta.intellecta_backend.model;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.*;
import lombok.*;

/**
 * Admin-managed badge definition.
 * System badges are seeded from BadgeType enum; admins can add custom ones too.
 */
@Entity
@Table(name = "badge_definitions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BadgeDefinition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Unique key — enum name for system badges (e.g. "STREAK_FIRE"), slug for custom ones */
    @Column(nullable = false, unique = true)
    private String badgeKey;

    @Column(nullable = false)
    private String displayName;

    @Column(length = 1000)
    private String description;

    /** COMMON | RARE | EPIC | LEGENDARY */
    @Column(nullable = false)
    private String rarity;

    /** Admin-set ideal unlock percentage (e.g. 70.0 for COMMON) */
    @Column
    private Double targetPercentage;

    /** Relative path to uploaded image file; null = use generic fallback */
    @Column
    private String imageFilePath;

    // ── Rule configuration ────────────────────────────────────────────────────
    /**
     * STREAK_DAYS         — user.streakDays >= threshold
     * TOTAL_SESSIONS      — count of all sessions >= threshold
     * SESSION_DURATION    — any single session >= threshold minutes
     * EARLY_BIRD          — any session starting before 08:00
     * NIGHT_OWL           — any session starting after 22:00
     * TOTAL_NOTES         — total notes created >= threshold
     * TOTAL_POMODOROS     — total pomodoros completed >= threshold
     * DEEP_WORK_SESSION   — any deep-work session >= threshold minutes
     */
    @Column(nullable = false)
    private String ruleType;

    /** Numeric threshold for the rule (e.g. 7 for STREAK_DAYS=7) */
    @Column(nullable = false)
    @Builder.Default
    private int ruleThreshold = 1;

    /** true = seeded from enum, cannot be deleted; false = admin-created */
    @Column(nullable = false)
    @Builder.Default
    private boolean systemDefined = false;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
