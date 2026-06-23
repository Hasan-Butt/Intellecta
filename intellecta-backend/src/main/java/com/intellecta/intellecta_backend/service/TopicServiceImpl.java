package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.dto.request.TopicBulkSaveRequest;
import com.intellecta.intellecta_backend.dto.request.TopicRequest;
import com.intellecta.intellecta_backend.dto.response.TopicResponse;
import com.intellecta.intellecta_backend.enums.TopicStatus;
import com.intellecta.intellecta_backend.model.Exam;
import com.intellecta.intellecta_backend.model.Subject;
import com.intellecta.intellecta_backend.model.Topic;
import com.intellecta.intellecta_backend.repository.ExamRepository;
import com.intellecta.intellecta_backend.repository.SubjectRepository;
import com.intellecta.intellecta_backend.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import com.intellecta.intellecta_backend.security.SecurityUtils;

@Service
@RequiredArgsConstructor
public class TopicServiceImpl implements TopicService {

    private final TopicRepository topicRepository;
    private final SubjectRepository subjectRepository;
    private final ExamRepository examRepository;

    @Override
    public TopicResponse createTopic(Long subjectId, TopicRequest request) {
        Subject subject = subjectRepository.findById(subjectId)
            .orElseThrow(() -> new RuntimeException("Subject not found"));
        SecurityUtils.validateUser(subject.getUser().getId());

        Exam exam = null;
        if (request.getExamId() != null) {
            exam = examRepository.findById(request.getExamId())
                .orElse(null);
            if (exam != null) {
                SecurityUtils.validateUser(exam.getSubject().getUser().getId());
            }
        }

        Topic topic = Topic.builder()
            .title(request.getTitle())
            .description(request.getDescription())
            .status(request.getStatus() != null ? request.getStatus() : TopicStatus.NOT_STARTED)
            .subject(subject)
            .exam(exam)
            .build();

        return toResponse(topicRepository.save(topic));
    }

    @Override
    public List<TopicResponse> getTopicsBySubject(Long subjectId) {
        Subject subject = subjectRepository.findById(subjectId)
            .orElseThrow(() -> new RuntimeException("Subject not found"));
        SecurityUtils.validateUser(subject.getUser().getId());
        
        return topicRepository.findBySubjectIdOrderByIdAsc(subjectId)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<TopicResponse> getTopicsByExam(Long examId) {
        Exam exam = examRepository.findById(examId)
            .orElseThrow(() -> new RuntimeException("Exam not found"));
        SecurityUtils.validateUser(exam.getSubject().getUser().getId());

        return topicRepository.findByExamIdOrderByIdAsc(examId)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public void bulkUpdateStatuses(TopicBulkSaveRequest request) {
        if (request.getUpdates() == null) return;
        for (TopicBulkSaveRequest.TopicStatusUpdate update : request.getUpdates()) {
            topicRepository.findById(update.getId()).ifPresent(topic -> {
                SecurityUtils.validateUser(topic.getSubject().getUser().getId());
                topic.setStatus(TopicStatus.valueOf(update.getStatus()));
                topicRepository.save(topic);
            });
        }
    }

    @Override
    public void deleteTopic(Long topicId) {
        Topic topic = topicRepository.findById(topicId)
            .orElseThrow(() -> new RuntimeException("Topic not found"));
        SecurityUtils.validateUser(topic.getSubject().getUser().getId());
        topicRepository.delete(topic);
    }

    private TopicResponse toResponse(Topic t) {
        return TopicResponse.builder()
            .id(t.getId())
            .title(t.getTitle())
            .description(t.getDescription())
            .status(t.getStatus().name())
            .subjectId(t.getSubject().getId())
            .examId(t.getExam() != null ? t.getExam().getId() : null)
            .build();
    }
}