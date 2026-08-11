package com.intellecta.intellecta_backend.dto.response;

import com.intellecta.intellecta_backend.enums.QuestionType;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class SubmissionDetailResponse {

    private Long attemptId;
    private Long userId;
    private String studentName;
    private String quizTopic;
    private String quizCategory;
    private int objectiveScore;
    private Integer totalMarks;
    private Integer maxMarks; // max marks available in the quiz (sum of question maxMarks)
    private boolean graded;
    private List<QuestionView> questions;

    @Data
    @Builder
    public static class QuestionView {
        private Long id;
        private String text;
        private QuestionType type;
        private List<String> options;
        private Integer correctOptionIndex;
        private Integer maxMarks;
        private String modelAnswer;
        private Integer selectedOptionIndex;
        private String studentAnswer;
        private Integer awardedMarks;
        private Boolean isCorrect;
    }
}