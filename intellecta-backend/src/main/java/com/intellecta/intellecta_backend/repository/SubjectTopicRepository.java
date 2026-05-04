package com.intellecta.intellecta_backend.repository;

import com.intellecta.intellecta_backend.model.SubjectTopic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubjectTopicRepository extends JpaRepository<SubjectTopic, Long> {
    List<SubjectTopic> findByCategoryId(Long categoryId);
}
