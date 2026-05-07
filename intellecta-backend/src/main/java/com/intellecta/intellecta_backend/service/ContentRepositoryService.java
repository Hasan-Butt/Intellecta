package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.model.SubjectCategory;
import com.intellecta.intellecta_backend.model.SubjectTopic;
import com.intellecta.intellecta_backend.repository.QuizRepository;
import com.intellecta.intellecta_backend.repository.QuizAttemptRepository;
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
    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;

    public List<SubjectCategory> getAllCategories() {
        List<SubjectCategory> categories = categoryRepository.findAll();
        categories.forEach(cat -> {
            cat.setQuizCount(quizRepository.countByCategory(cat.getName()));
        });
        return categories;
    }

    public List<com.intellecta.intellecta_backend.dto.response.AdaptiveCategoryDto> getAdaptiveStats() {
        List<com.intellecta.intellecta_backend.model.QuizAttempt> allAttempts = quizAttemptRepository.findAll();
        
        java.util.Map<String, java.util.List<com.intellecta.intellecta_backend.model.QuizAttempt>> attemptsByCategory = allAttempts.stream()
                .filter(a -> a.getQuiz() != null && a.getQuiz().getCategory() != null)
                .collect(java.util.stream.Collectors.groupingBy(a -> a.getQuiz().getCategory()));

        return attemptsByCategory.entrySet().stream()
                .map(entry -> {
                    String categoryName = entry.getKey();
                    java.util.List<com.intellecta.intellecta_backend.model.QuizAttempt> attempts = entry.getValue();
                    long totalAttempts = attempts.size();
                    long failureCount = attempts.stream()
                            .filter(a -> a.getScore() != null && a.getTotalQuestions() != null && a.getTotalQuestions() > 0)
                            .filter(a -> (double) a.getScore() / a.getTotalQuestions() < 0.5)
                            .count();
                    double failureRate = totalAttempts == 0 ? 0.0 : (double) failureCount / totalAttempts * 100.0;

                    return com.intellecta.intellecta_backend.dto.response.AdaptiveCategoryDto.builder()
                            .categoryName(categoryName)
                            .failureRate(Math.round(failureRate * 10) / 10.0)
                            .totalAttempts(totalAttempts)
                            .failureCount(failureCount)
                            .build();
                })
                .filter(dto -> dto.getTotalAttempts() > 0)
                .sorted(java.util.Comparator.comparing(com.intellecta.intellecta_backend.dto.response.AdaptiveCategoryDto::getFailureRate).reversed())
                .limit(5)
                .collect(java.util.stream.Collectors.toList());
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
