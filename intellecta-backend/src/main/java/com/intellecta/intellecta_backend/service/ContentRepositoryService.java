package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.model.SubjectCategory;
import com.intellecta.intellecta_backend.model.SubjectTopic;
import com.intellecta.intellecta_backend.repository.SubjectCategoryRepository;
import com.intellecta.intellecta_backend.repository.SubjectTopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ContentRepositoryService {

    private final SubjectCategoryRepository categoryRepository;
    private final SubjectTopicRepository topicRepository;

    public List<SubjectCategory> getAllCategories() {
        return categoryRepository.findAll();
    }

    public SubjectCategory createCategory(SubjectCategory category) {
        return categoryRepository.save(category);
    }

    public SubjectTopic addTopicToCategory(Long categoryId, String topicName) {
        SubjectCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        SubjectTopic topic = SubjectTopic.builder()
                .name(topicName)
                .category(category)
                .build();
        return topicRepository.save(topic);
    }

    public List<SubjectTopic> getTopicsByCategory(Long categoryId) {
        return topicRepository.findByCategoryId(categoryId);
    }

    public void deleteCategory(Long categoryId) {
        categoryRepository.deleteById(categoryId);
    }

    public void deleteTopic(Long topicId) {
        topicRepository.deleteById(topicId);
    }

    public SubjectCategory updateCategory(Long id, SubjectCategory updated) {
        SubjectCategory existing = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setCode(updated.getCode());
        existing.setIconName(updated.getIconName());
        existing.setBgColor(updated.getBgColor());
        return categoryRepository.save(existing);
    }
}
