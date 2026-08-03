package com.intellecta.intellecta_backend.repository;

import com.intellecta.intellecta_backend.model.SystemAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SystemAlertRepository extends JpaRepository<SystemAlert, Long> {

    // Dashboard: show only active (unresolved) alerts, newest first
    List<SystemAlert> findTop10ByResolvedFalseOrderByAlertTimeDesc();

    // Dedup: find an active alert by key
    Optional<SystemAlert> findFirstByAlertKeyAndResolvedFalse(String alertKey);

    // Dedup with time window: used for point-in-time alerts (login anomaly, excessive hours)
    boolean existsByAlertKeyAndResolvedFalseAndAlertTimeAfter(String alertKey, LocalDateTime since);

    // Auto-resolve scan: find all active alerts whose key starts with a prefix (e.g. "QUIZ_FAILURE:")
    List<SystemAlert> findByAlertKeyStartingWithAndResolvedFalse(String prefix);
}
