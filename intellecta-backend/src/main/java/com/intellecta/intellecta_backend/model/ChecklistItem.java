package com.intellecta.intellecta_backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "checklist_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChecklistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String description;

    @Builder.Default
    private boolean done = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;
}