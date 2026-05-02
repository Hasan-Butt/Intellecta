package com.intellecta.intellecta_backend.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.intellecta.intellecta_backend.model.DistractionEntry;

public interface DistractionRepository extends JpaRepository<DistractionEntry, Long> {

    // Most recent entry
    DistractionEntry findTopByUserIdOrderByLoggedAtDesc(Long userId);

    // All entries in last 7 days
    List<DistractionEntry> findByUserIdAndLoggedAtAfterOrderByLoggedAtDesc(
        Long userId, LocalDateTime after);

    // Count per day for the mini bar chart (Mon–Sun)
    @Query("""
        SELECT CAST(d.loggedAt AS date) as day, COUNT(d.id) as cnt
        FROM DistractionEntry d
        WHERE d.user.id = :userId AND d.loggedAt >= :from
        GROUP BY CAST(d.loggedAt AS date)
        ORDER BY CAST(d.loggedAt AS date)
        """)
    List<Object[]> dailyDistractionCounts(Long userId, LocalDateTime from);
}