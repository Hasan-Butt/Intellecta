package com.intellecta.intellecta_backend.model;

import java.time.LocalDate;

import org.hibernate.annotations.ColumnDefault;

import com.intellecta.intellecta_backend.enums.CourseDifficulty;

import jakarta.persistence.*;
import lombok.*;



@Entity
@Table(name = "courses")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String courseName;

    private LocalDate examDate;

    @Enumerated(EnumType.STRING)
    @ColumnDefault("'MEDIUM'")
    @Builder.Default
    private CourseDifficulty difficulty = CourseDifficulty.MEDIUM;   // EASY | MEDIUM | HARD

    // planned study hours per day for schedule generator
    @Builder.Default
    private double plannedHoursPerDay = 2.0;
}