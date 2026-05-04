package com.intellecta.intellecta_backend.config;

import com.intellecta.intellecta_backend.model.SubjectCategory;
import com.intellecta.intellecta_backend.model.SubjectTopic;
import com.intellecta.intellecta_backend.repository.SubjectCategoryRepository;
import com.intellecta.intellecta_backend.repository.SubjectTopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class ContentDataSeeder implements CommandLineRunner {

    private final SubjectCategoryRepository categoryRepository;
    private final SubjectTopicRepository topicRepository;

    @Override
    public void run(String... args) throws Exception {
        if (categoryRepository.count() == 0) {
            SubjectCategory psychology = SubjectCategory.builder()
                    .name("Cognitive Psychology")
                    .description("In-depth study of mental processes including perception, thought, memory, and neural cognition patterns.")
                    .code("PSYCH-402")
                    .iconName("Brain")
                    .bgColor("bg-purple-50")
                    .build();

            SubjectCategory dataScience = SubjectCategory.builder()
                    .name("Data Science")
                    .description("Foundational principles of data analysis, statistical modeling, and machine learning architectures.")
                    .code("CS-101")
                    .iconName("Database")
                    .bgColor("bg-emerald-50")
                    .build();

            categoryRepository.saveAll(Arrays.asList(psychology, dataScience));

            topicRepository.saveAll(Arrays.asList(
                SubjectTopic.builder().name("Advanced Cognition Theory").category(psychology).build(),
                SubjectTopic.builder().name("Neural Networks & Memory").category(psychology).build(),
                SubjectTopic.builder().name("Sensory Perception").category(psychology).build(),
                SubjectTopic.builder().name("Linear Algebra Foundations").category(dataScience).build(),
                SubjectTopic.builder().name("Probability & Stats Basics").category(dataScience).build(),
                SubjectTopic.builder().name("Intro to ML Algorithms").category(dataScience).build()
            ));

            System.out.println("Content Repository data seeded successfully.");
        }
    }
}
