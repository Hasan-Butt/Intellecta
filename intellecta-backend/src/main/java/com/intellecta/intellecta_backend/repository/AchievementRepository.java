package com.intellecta.intellecta_backend.repository;

import com.intellecta.intellecta_backend.model.Achievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface AchievementRepository extends JpaRepository<Achievement, Long> {

    List<Achievement> findTop3ByUserIdOrderByEarnedAtDesc(Long userId);

    List<Achievement> findByUserIdOrderByEarnedAtDesc(Long userId);

    long countByUserId(Long userId);

    boolean existsByUserIdAndBadgeName(Long userId, String badgeName);

    /** How many distinct users have earned a given badge */
    @Query("SELECT COUNT(a) FROM Achievement a WHERE a.badgeName = :badgeName")
    long countByBadgeName(String badgeName);
}