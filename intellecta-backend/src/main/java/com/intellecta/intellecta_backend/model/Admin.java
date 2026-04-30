package com.intellecta.intellecta_backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "admins")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Admin {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String department;

    @Column(name = "admin_level")
    private Integer adminLevel;
}
