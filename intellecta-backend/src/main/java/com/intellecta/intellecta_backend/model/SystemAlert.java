package com.intellecta.intellecta_backend.model;

import jakarta.persistence.*;
import lombok.*;
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
    private String iconType;  // ANOMALY, PERFORMANCE, SECURITY
}
