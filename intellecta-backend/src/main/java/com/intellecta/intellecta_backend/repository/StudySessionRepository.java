package com.intellecta.intellecta_backend.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.intellecta.intellecta_backend.model.StudySession;

public interface StudySessionRepository extends JpaRepository<StudySession, Long> {

    List<StudySession> findByUserIdOrderByStartTimeDesc(Long userId);

    List<StudySession> findTop5ByUserIdOrderByStartTimeDesc(Long userId);

    List<StudySession> findByUserIdAndStartTimeAfter(Long userId, LocalDateTime after);

    long countByUserId(Long userId);

    // Total pomodoros ever completed by a user
    @Query("SELECT SUM(s.pomodorosCompleted) FROM StudySession s WHERE s.user.id = :userId")
    Integer sumPomodorosByUserId(Long userId);

    // Per-day focus minutes for the last 7 days (used by the bar chart)
    @Query("""
        SELECT CAST(s.startTime AS date) as day,
               SUM(DATEDIFF(minute, s.startTime, s.endTime)) as minutes
        FROM StudySession s
        WHERE s.user.id = :userId
          AND s.startTime >= :from
          AND s.endTime IS NOT NULL
        GROUP BY CAST(s.startTime AS date)
        ORDER BY CAST(s.startTime AS date)
        """)
    List<Object[]> dailyFocusMinutes(Long userId, LocalDateTime from);
}