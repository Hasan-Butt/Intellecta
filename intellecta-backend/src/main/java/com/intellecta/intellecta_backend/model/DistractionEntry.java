package com.intellecta.intellecta_backend.model;

import java.time.LocalDateTime;

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

    @Column(nullable = true)
    private String duration;

    @Column(nullable = true)
    private String impact;

    @Column(nullable = false)
    private LocalDateTime loggedAt;

    @PrePersist
    private void ensureLoggedAt() {
        if (loggedAt == null) {
            loggedAt = LocalDateTime.now();
        }
    }
}