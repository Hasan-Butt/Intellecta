package com.intellecta.intellecta_backend.repository;

import com.intellecta.intellecta_backend.model.StudentVideoLecture;
import com.intellecta.intellecta_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentVideoLectureRepository extends JpaRepository<StudentVideoLecture, Long> {

    /** All lectures belonging to a specific student, ordered by position */
    List<StudentVideoLecture> findAllByStudentOrderByOrderIndexAsc(User student);

    /** Lookup by id + student for ownership validation */
    Optional<StudentVideoLecture> findByIdAndStudent(Long id, User student);
}
