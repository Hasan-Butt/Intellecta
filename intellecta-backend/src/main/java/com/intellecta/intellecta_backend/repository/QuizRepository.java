package com.intellecta.intellecta_backend.repository;

import com.intellecta.intellecta_backend.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {

    @org.springframework.data.jpa.repository.Query("SELECT q FROM Quiz q LEFT JOIN FETCH q.questions")
    java.util.List<Quiz> findAllWithQuestions();

    long countByCategory(String category);
}