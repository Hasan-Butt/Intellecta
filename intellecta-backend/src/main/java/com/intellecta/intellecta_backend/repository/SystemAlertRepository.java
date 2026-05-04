package com.intellecta.intellecta_backend.repository;

import com.intellecta.intellecta_backend.model.SystemAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SystemAlertRepository extends JpaRepository<SystemAlert, Long> {
    List<SystemAlert> findTop10ByOrderByAlertTimeDesc();
}
