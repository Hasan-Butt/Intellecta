package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.dto.request.TopicBulkSaveRequest;
import com.intellecta.intellecta_backend.dto.request.QuizTopicRequest;
import com.intellecta.intellecta_backend.dto.response.TopicResponse;
import java.util.List;

public interface QuizTopicService {
    TopicResponse createTopic(Long subjectId, QuizTopicRequest request);
    List<TopicResponse> getTopicsBySubject(Long subjectId);
    List<TopicResponse> getTopicsByExam(Long examId);
    void bulkUpdateStatuses(TopicBulkSaveRequest request);
    void deleteTopic(Long topicId);
}
