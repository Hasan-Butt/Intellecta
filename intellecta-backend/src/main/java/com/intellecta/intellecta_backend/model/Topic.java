package com.intellecta.intellecta_backend.model;

import com.intellecta.intellecta_backend.enums.TopicStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "topics")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Topic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "VARCHAR(50)", nullable = false)
    @Builder.Default
    private TopicStatus status = TopicStatus.NOT_STARTED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    // nullable — if null, topic is "general" and not linked to any exam
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_id", nullable = true)
    private Exam exam;
}