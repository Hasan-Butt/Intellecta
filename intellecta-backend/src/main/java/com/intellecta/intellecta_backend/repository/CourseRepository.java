package com.intellecta.intellecta_backend.repository;

import com.intellecta.intellecta_backend.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {

    List<Course> findByUserIdOrderByExamDateAsc(Long userId);

    List<Course> findByUserIdAndExamDateAfterOrderByExamDateAsc(
        Long userId, LocalDate after);
}