package com.intellecta.intellecta_backend.controller;

import com.intellecta.intellecta_backend.dto.request.TopicBulkSaveRequest;
import com.intellecta.intellecta_backend.dto.request.TopicRequest;
import com.intellecta.intellecta_backend.dto.response.TopicResponse;
import com.intellecta.intellecta_backend.service.TopicService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/topics")
@RequiredArgsConstructor
public class TopicController {

    private final TopicService topicService;

    @PostMapping("/subject/{subjectId}")
    public ResponseEntity<TopicResponse> createTopic(
            @PathVariable Long subjectId,
            @RequestBody TopicRequest request) {
        return ResponseEntity.ok(topicService.createTopic(subjectId, request));
    }

    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<List<TopicResponse>> getTopics(@PathVariable Long subjectId) {
        return ResponseEntity.ok(topicService.getTopicsBySubject(subjectId));
    }

    // New endpoint — get only topics linked to a specific exam
    @GetMapping("/exam/{examId}")
    public ResponseEntity<List<TopicResponse>> getTopicsByExam(@PathVariable Long examId) {
        return ResponseEntity.ok(topicService.getTopicsByExam(examId));
    }

    @PutMapping("/bulk-status")
    public ResponseEntity<Void> bulkUpdateStatuses(@RequestBody TopicBulkSaveRequest request) {
        topicService.bulkUpdateStatuses(request);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{topicId}")
    public ResponseEntity<Void> deleteTopic(@PathVariable Long topicId) {
        topicService.deleteTopic(topicId);
        return ResponseEntity.noContent().build();
    }
}