package com.intellecta.intellecta_backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import java.time.LocalDateTime;

@Entity
@Table(name = "system_alerts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemAlert {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 500)
    private String description;

    private LocalDateTime alertTime;

    @Column(name = "alert_type")
    private String alertType; // CRITICAL, WARNING, RESOLVED

    @Column(name = "icon_type")
    private String iconType;  // ANOMALY, PERFORMANCE, SECURITY, SYSTEM

    // Stable key used for dedup — one active alert per condition (e.g. "QUIZ_FAILURE:OOP")
    @Column(name = "alert_key", length = 255)
    private String alertKey;

    // False = active/unresolved; true = condition has cleared or alert was auto-resolved
    @Column(name = "resolved", nullable = false)
    @ColumnDefault("false")
    @Builder.Default
    private boolean resolved = false;
}
