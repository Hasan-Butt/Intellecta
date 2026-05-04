package com.intellecta.intellecta_backend.repository;

import com.intellecta.intellecta_backend.model.SubjectCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubjectCategoryRepository extends JpaRepository<SubjectCategory, Long> {
}
