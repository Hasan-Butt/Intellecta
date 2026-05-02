package com.intellecta.intellecta_backend.repository;

import com.intellecta.intellecta_backend.model.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TopicRepository extends JpaRepository<Topic, Long> {
    List<Topic> findBySubjectIdOrderByIdAsc(Long subjectId);
    List<Topic> findByExamIdOrderByIdAsc(Long examId);
    List<Topic> findBySubjectIdAndExamIsNullOrderByIdAsc(Long subjectId);
}