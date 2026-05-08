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
    @Query(value = """
    SELECT CAST(s.start_time AS date) AS day,
           SUM(DATEDIFF(minute, s.start_time, s.end_time)) AS minutes
    FROM study_sessions s
    WHERE s.user_id = :userId
      AND s.start_time >= :from
      AND s.end_time IS NOT NULL
    GROUP BY CAST(s.start_time AS date)
    ORDER BY CAST(s.start_time AS date)
    """, nativeQuery = true)
List<Object[]> dailyFocusMinutes(Long userId, LocalDateTime from);
}