package com.intellecta.intellecta_backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;

@Entity
@Table(name = "sectional_xp", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "category"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SectionalXP {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    @ColumnDefault("0")
    @Builder.Default
    private long xp = 0;
}