package com.intellecta.intellecta_backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "analytics")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Analytics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
}