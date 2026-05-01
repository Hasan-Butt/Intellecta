package com.intellecta.intellecta_backend.repository;

import com.intellecta.intellecta_backend.model.ChecklistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChecklistItemRepository extends JpaRepository<ChecklistItem, Long> {
    List<ChecklistItem> findByExamIdOrderByIdAsc(Long examId);
}