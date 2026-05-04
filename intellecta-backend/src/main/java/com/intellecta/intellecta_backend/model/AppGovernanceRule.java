package com.intellecta.intellecta_backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "app_governance_rules")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AppGovernanceRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String appName;

    @Column(nullable = false)
    private String type;

    private LocalDateTime createdAt;
}
