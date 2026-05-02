package com.intellecta.intellecta_backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.intellecta.intellecta_backend.model.Analytics;

public interface AnalyticsRepository extends JpaRepository<Analytics, Long> {
    Optional<Analytics> findByUserId(Long userId);
}