package com.intellecta.intellecta_backend.repository;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.intellecta.intellecta_backend.model.StudySession;

public interface StudySessionRepository extends JpaRepository<StudySession, Long> {

    List<StudySession> findByUserIdOrderByStartTimeDesc(Long userId);

    List<StudySession> findTop5ByUserIdOrderByStartTimeDesc(Long userId);

    List<StudySession> findByUserIdAndStartTimeAfter(Long userId, LocalDateTime after);

    long countByUserId(Long userId);

    // Total pomodoros ever completed by a user
    @Query("SELECT SUM(s.pomodorosCompleted) FROM StudySession s WHERE s.user.id = :userId")
    Integer sumPomodorosByUserId(Long userId);

    // Fetch all completed sessions (non-null start+end) — used to compute focus minutes in Java
    @Query("SELECT s FROM StudySession s WHERE s.startTime IS NOT NULL AND s.endTime IS NOT NULL")
    List<StudySession> findAllCompletedSessions();

    // Fetch completed sessions for a user within a date range
    @Query("SELECT s FROM StudySession s WHERE s.user.id = :userId AND s.startTime >= :from AND s.endTime IS NOT NULL")
    List<StudySession> findCompletedByUserSince(@Param("userId") Long userId, @Param("from") LocalDateTime from);

    // ── Database-agnostic aggregates (computed in Java) ──────────────────────

    // Returns Object[]{userId, totalMinutes} per user — same shape as before
    default List<Object[]> totalFocusMinutesByUser() {
        Map<Long, Long> minutesByUser = findAllCompletedSessions().stream()
            .collect(Collectors.groupingBy(
                s -> s.getUser().getId(),
                Collectors.summingLong(s -> Duration.between(s.getStartTime(), s.getEndTime()).toMinutes())
            ));
        return minutesByUser.entrySet().stream()
            .map(e -> new Object[]{ e.getKey(), e.getValue() })
            .collect(Collectors.toList());
    }

    // Returns Object[]{java.sql.Date, totalMinutes} per day — same shape as before
    default List<Object[]> dailyFocusMinutes(@Param("userId") Long userId, @Param("from") LocalDateTime from) {
        Map<java.time.LocalDate, Long> minutesByDay = findCompletedByUserSince(userId, from).stream()
            .collect(Collectors.groupingBy(
                s -> s.getStartTime().toLocalDate(),
                Collectors.summingLong(s -> Duration.between(s.getStartTime(), s.getEndTime()).toMinutes())
            ));
        return minutesByDay.entrySet().stream()
            .sorted(Map.Entry.comparingByKey())
            .map(e -> new Object[]{ java.sql.Date.valueOf(e.getKey()), e.getValue() })
            .collect(Collectors.toList());
    }
}