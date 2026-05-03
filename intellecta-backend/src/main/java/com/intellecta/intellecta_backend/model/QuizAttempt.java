package com.intellecta.intellecta_backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_attempts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class QuizAttempt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "quiz_id")
    private Quiz quiz;

    private Integer score;
    private Integer totalQuestions;
    private Integer xpGained;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status; // "IN_PROGRESS", "COMPLETED"

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "quiz_attempt_answers", joinColumns = @JoinColumn(name = "attempt_id"))
    @MapKeyColumn(name = "question_id")
    @Column(name = "selected_option_index")
    private java.util.Map<Long, Integer> userAnswers = new java.util.HashMap<>();   
}