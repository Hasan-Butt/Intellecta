package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.dto.request.ExamRequest;
import com.intellecta.intellecta_backend.dto.response.ExamResponse;
import com.intellecta.intellecta_backend.model.Exam;
import com.intellecta.intellecta_backend.model.Subject;
import com.intellecta.intellecta_backend.repository.ExamRepository;
import com.intellecta.intellecta_backend.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExamServiceImpl implements ExamService {

    private final ExamRepository examRepository;
    private final SubjectRepository subjectRepository;

    @Override
    public ExamResponse createExam(ExamRequest request) {
        Subject subject = subjectRepository.findById(request.getSubjectId())
            .orElseThrow(() -> new RuntimeException("Subject not found"));

        Exam exam = Exam.builder()
            .name(request.getName())
            .examDate(LocalDate.parse(request.getExamDate()))
            .subject(subject)
            .build();

        return toResponse(examRepository.save(exam));
    }

    @Override
    public List<ExamResponse> getExamsBySubject(Long subjectId) {
        return examRepository.findBySubjectIdOrderByExamDateAsc(subjectId)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public ExamResponse updateExamDate(Long examId, String newDate) {
        Exam exam = examRepository.findById(examId)
            .orElseThrow(() -> new RuntimeException("Exam not found"));
        exam.setExamDate(LocalDate.parse(newDate));
        return toResponse(examRepository.save(exam));
    }

    @Override
    public void deleteExam(Long examId) {
        examRepository.deleteById(examId);
    }

    private ExamResponse toResponse(Exam exam) {
        long daysLeft = ChronoUnit.DAYS.between(LocalDate.now(), exam.getExamDate());
        return ExamResponse.builder()
            .id(exam.getId())
            .name(exam.getName())
            .examDate(exam.getExamDate().toString())
            .subjectId(exam.getSubject().getId())
            .subjectName(exam.getSubject().getName())
            .daysLeft(daysLeft)
            .build();
    }
}