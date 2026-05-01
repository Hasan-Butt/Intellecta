package com.intellecta.intellecta_backend.repository;

import com.intellecta.intellecta_backend.model.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findBySubjectIdOrderByExamDateAsc(Long subjectId);
}