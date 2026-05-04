package com.intellecta.intellecta_backend.repository;

import com.intellecta.intellecta_backend.model.AppGovernanceRule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AppGovernanceRuleRepository extends JpaRepository<AppGovernanceRule, Long> {
    List<AppGovernanceRule> findByType(String type);
    boolean existsByAppNameIgnoreCaseAndType(String appName, String type);
    List<AppGovernanceRule> findAllByOrderByCreatedAtDesc();
}
