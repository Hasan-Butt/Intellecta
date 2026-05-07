package com.intellecta.intellecta_backend.controller;

import com.intellecta.intellecta_backend.model.SubjectCategory;
import com.intellecta.intellecta_backend.model.SubjectTopic;
import com.intellecta.intellecta_backend.service.ContentRepositoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.intellecta.intellecta_backend.dto.request.QuizTopicRequest;

@RestController
@RequestMapping("/api/content")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ContentRepositoryController {

    private final ContentRepositoryService contentRepositoryService;

    @GetMapping("/categories")
    public ResponseEntity<List<SubjectCategory>> getAllCategories() {
        return ResponseEntity.ok(contentRepositoryService.getAllCategories());
    }

    @GetMapping("/adaptive-stats")
    public ResponseEntity<List<com.intellecta.intellecta_backend.dto.response.AdaptiveCategoryDto>> getAdaptiveStats() {
        return ResponseEntity.ok(contentRepositoryService.getAdaptiveStats());
    }

    @PostMapping("/categories")
    public ResponseEntity<SubjectCategory> createCategory(@RequestBody SubjectCategory category) {
        return ResponseEntity.ok(contentRepositoryService.createCategory(category));
    }

    @GetMapping("/categories/{categoryId}/topics")
    public ResponseEntity<List<SubjectTopic>> getTopicsByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(contentRepositoryService.getTopicsByCategory(categoryId));
    }

    @PostMapping("/categories/{categoryId}/topics")
    public ResponseEntity<SubjectTopic> addTopic(@PathVariable Long categoryId, @RequestBody QuizTopicRequest request) {
        return ResponseEntity.ok(contentRepositoryService.addTopicToCategory(categoryId, request.getName()));
    }

    @DeleteMapping("/categories/{categoryId}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long categoryId) {
        contentRepositoryService.deleteCategory(categoryId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/topics/{topicId}")
    public ResponseEntity<Void> deleteTopic(@PathVariable Long topicId) {
        contentRepositoryService.deleteTopic(topicId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/categories/{categoryId}")
    public ResponseEntity<SubjectCategory> updateCategory(@PathVariable Long categoryId, @RequestBody SubjectCategory category) {
        return ResponseEntity.ok(contentRepositoryService.updateCategory(categoryId, category));
    }
}