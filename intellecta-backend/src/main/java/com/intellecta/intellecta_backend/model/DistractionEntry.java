package com.intellecta.intellecta_backend.model;

import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "distraction_entries")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DistractionEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String reason;   // free text or tag label

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime loggedAt;
}