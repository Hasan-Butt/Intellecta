package com.intellecta.intellecta_backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.intellecta.intellecta_backend.enums.QuestionType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "questions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class Question {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String text;

    @ElementCollection
    @CollectionTable(name = "question_options", joinColumns = @JoinColumn(name = "question_id"))
    @Column(name = "option_text")
    private List<String> options;

    // WRITE_ONLY: admin can set it when creating a quiz, but it is never
    // serialized back to the client (students must not see correct answers).
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Integer correctOptionIndex;

    @Enumerated(EnumType.STRING)
    private QuestionType questionType = QuestionType.OBJECTIVE;

    private Integer maxMarks;

    // WRITE_ONLY: settable by admin when creating a quiz; visible only via
    // the grading/detail responses, never in the student quiz payload.
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String modelAnswer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id")
    @JsonIgnore
    private Quiz quiz;
}
