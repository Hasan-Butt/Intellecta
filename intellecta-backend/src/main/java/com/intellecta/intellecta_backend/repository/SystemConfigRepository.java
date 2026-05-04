package com.intellecta.intellecta_backend.repository;

import com.intellecta.intellecta_backend.model.SystemConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SystemConfigRepository extends JpaRepository<SystemConfig, Long> {
    Optional<SystemConfig> findFirstBy();
}
