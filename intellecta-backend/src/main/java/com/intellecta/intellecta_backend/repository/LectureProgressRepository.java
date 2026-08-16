package com.intellecta.intellecta_backend.repository;

import com.intellecta.intellecta_backend.model.LectureProgress;
import com.intellecta.intellecta_backend.model.User;
import com.intellecta.intellecta_backend.model.VideoLecture;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LectureProgressRepository extends JpaRepository<LectureProgress, Long> {

    Optional<LectureProgress> findByUserAndLecture(User user, VideoLecture lecture);

    List<LectureProgress> findAllByUser(User user);
}
