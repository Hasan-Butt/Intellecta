package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.dto.request.ExamRequest;
import com.intellecta.intellecta_backend.dto.response.ExamResponse;
import java.util.List;

public interface ExamService {
    ExamResponse createExam(ExamRequest request);
    List<ExamResponse> getExamsBySubject(Long subjectId);
    ExamResponse updateExamDate(Long examId, String newDate);
    void deleteExam(Long examId);
}