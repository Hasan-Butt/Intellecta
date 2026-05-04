package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.dto.request.TopicBulkSaveRequest;
import com.intellecta.intellecta_backend.dto.request.QuizTopicRequest;
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
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class QuizTopicServiceImplementation implements QuizTopicService {

    private final TopicRepository topicRepository;
    private final SubjectRepository subjectRepository;
    private final ExamRepository examRepository;

    @Override
    public TopicResponse createTopic(Long subjectId, QuizTopicRequest request) {
        Subject subject = subjectRepository.findById(subjectId)
            .orElseThrow(() -> new RuntimeException("Subject not found with ID: " + subjectId));

        Exam exam = null;
        if (request.getExamId() != null) {
            exam = examRepository.findById(request.getExamId())
                .orElse(null);
        }

        Topic topic = Topic.builder()
            .title(request.getName())
            .description(request.getDescription())
            .status(request.getStatus() != null ? request.getStatus() : TopicStatus.NOT_STARTED)
            .subject(subject)
            .exam(exam)
            .build();

        return toResponse(topicRepository.save(topic));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TopicResponse> getTopicsBySubject(Long subjectId) {
        return topicRepository.findBySubjectIdOrderByIdAsc(subjectId)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TopicResponse> getTopicsByExam(Long examId) {
        return topicRepository.findByExamIdOrderByIdAsc(examId)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public void bulkUpdateStatuses(TopicBulkSaveRequest request) {
        if (request.getUpdates() == null || request.getUpdates().isEmpty()) return;
        
        List<Topic> topicsToUpdate = new ArrayList<>();
        for (TopicBulkSaveRequest.TopicStatusUpdate update : request.getUpdates()) {
            topicRepository.findById(update.getId()).ifPresent(topic -> {
                try {
                    topic.setStatus(TopicStatus.valueOf(update.getStatus()));
                    topicsToUpdate.add(topic);
                } catch (IllegalArgumentException e) {
                    // Skip invalid status updates instead of crashing the whole bulk operation
                    System.err.println("Invalid status: " + update.getStatus() + " for topic: " + update.getId());
                }
            });
        }
        
        if (!topicsToUpdate.isEmpty()) {
            topicRepository.saveAll(topicsToUpdate);
        }
    }

    @Override
    public void deleteTopic(Long topicId) {
        topicRepository.deleteById(topicId);
    }

    private TopicResponse toResponse(Topic t) {
        return TopicResponse.builder()
            .id(t.getId())
            .title(t.getTitle())
            .description(t.getDescription())
            .status(t.getStatus().name())
            .subjectId(t.getSubject() != null ? t.getSubject().getId() : null)
            .examId(t.getExam() != null ? t.getExam().getId() : null)
            .build();
    }
}
