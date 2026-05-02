package com.intellecta.intellecta_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class PerformanceTrendDto {
    private long totalStudents;
    private double overallAverageScore;
    private long totalQuizAttempts;
    private long studentsAboveAverage;
    private List<StudentPerformanceDto> students;
    private List<SubjectPerformanceDto> subjectBreakdown;
    private List<String> weakTopics;
    private String dateFrom;
    private String dateTo;
}
