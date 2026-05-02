package com.intellecta.intellecta_backend.repository;

import com.intellecta.intellecta_backend.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
    List<Subject> findByUserIdOrderBySemesterAscNameAsc(Long userId);
    Optional<Subject> findByUserIdAndNameAndSemester(Long userId, String name, String semester);
    long countByUserId(Long userId);

}