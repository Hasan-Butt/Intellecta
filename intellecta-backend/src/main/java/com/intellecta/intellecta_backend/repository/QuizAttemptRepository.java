package com.intellecta.intellecta_backend.repository;

import com.intellecta.intellecta_backend.model.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    List<QuizAttempt> findByUserId(Long userId);
    
    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END FROM QuizAttempt a WHERE a.user.id = :userId AND a.quiz.id = :quizId")
    boolean existsByUserIdAndQuizId(@Param("userId") Long userId, @Param("quizId") Long quizId);

    @Query("SELECT COUNT(a) FROM QuizAttempt a WHERE a.startTime < :cutoff")
    long countOlderThan(@Param("cutoff") LocalDateTime cutoff);
}
