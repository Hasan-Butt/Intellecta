package com.intellecta.intellecta_backend.repository;

import com.intellecta.intellecta_backend.model.VideoLecture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VideoLectureRepository extends JpaRepository<VideoLecture, Long> {

    // Student view: only published lectures, ordered by position
    List<VideoLecture> findAllByPublishedTrueOrderByOrderIndexAsc();

    // Admin view: all lectures regardless of published state
    List<VideoLecture> findAllByOrderByOrderIndexAsc();

    // Admin view: filter by topic if needed
    List<VideoLecture> findByTopicOrderByOrderIndexAsc(String topic);
}