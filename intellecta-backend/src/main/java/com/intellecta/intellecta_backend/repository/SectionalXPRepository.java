package com.intellecta.intellecta_backend.repository;

import com.intellecta.intellecta_backend.model.SectionalXP;
import com.intellecta.intellecta_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SectionalXPRepository extends JpaRepository<SectionalXP, Long> {
    Optional<SectionalXP> findByUserAndCategory(User user, String category);
}