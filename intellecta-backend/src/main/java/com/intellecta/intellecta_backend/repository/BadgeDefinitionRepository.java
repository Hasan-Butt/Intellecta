package com.intellecta.intellecta_backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.intellecta.intellecta_backend.model.BadgeDefinition;

public interface BadgeDefinitionRepository extends JpaRepository<BadgeDefinition, Long> {

    Optional<BadgeDefinition> findByBadgeKey(String badgeKey);

    boolean existsByBadgeKey(String badgeKey);

    List<BadgeDefinition> findAllByOrderByRarityAscDisplayNameAsc();

    @Query("SELECT COUNT(b) FROM BadgeDefinition b WHERE b.rarity = :rarity")
    long countByRarity(String rarity);
}
