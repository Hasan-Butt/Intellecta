package com.intellecta.intellecta_backend.repository;

import com.intellecta.intellecta_backend.model.Achievement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AchievementRepository extends JpaRepository<Achievement, Long> {

    List<Achievement> findTop3ByUserIdOrderByEarnedAtDesc(Long userId);

    long countByUserId(Long userId);
}