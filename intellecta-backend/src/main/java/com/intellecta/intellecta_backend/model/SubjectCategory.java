package com.intellecta.intellecta_backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "subject_categories")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubjectCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String code;
    private String iconName; // e.g., "Brain", "Database"
    private String bgColor;  // e.g., "bg-purple-50"

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SubjectTopic> topics;
}
