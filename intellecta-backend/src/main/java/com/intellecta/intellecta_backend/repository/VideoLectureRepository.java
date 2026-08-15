package com.intellecta.intellecta_backend.repository;

import com.intellecta.intellecta_backend.model.VideoLecture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VideoLectureRepository extends JpaRepository<VideoLecture, Long> {

    // Student view: only published lectures for a specific course, ordered by position
    List<VideoLecture> findByCourseIdAndPublishedTrueOrderByOrderIndexAsc(Long courseId);

    // Admin view: all lectures for a course regardless of published state
    List<VideoLecture> findByCourseIdOrderByOrderIndexAsc(Long courseId);

    // Admin view: all lectures they created
    List<VideoLecture> findByAdminIdOrderByCreatedAtDesc(Long adminId);
}