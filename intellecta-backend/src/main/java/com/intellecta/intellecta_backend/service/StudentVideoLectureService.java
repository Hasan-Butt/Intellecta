package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.dto.request.VideoLectureRequest;
import com.intellecta.intellecta_backend.dto.response.StudentVideoLectureResponse;
import com.intellecta.intellecta_backend.model.StudentVideoLecture;
import com.intellecta.intellecta_backend.model.User;
import com.intellecta.intellecta_backend.repository.StudentVideoLectureRepository;
import com.intellecta.intellecta_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Service for managing a student's personally added YouTube lectures.
 * All operations are scoped to the calling student — they cannot read or modify
 * another student's lectures.
 */
@Service
@RequiredArgsConstructor
public class StudentVideoLectureService {

    private final StudentVideoLectureRepository studentLectureRepository;
    private final UserRepository userRepository;

    private static final Pattern YOUTUBE_ID_PATTERN = Pattern.compile(
        "(?:youtube\\.com/(?:watch\\?v=|embed/|shorts/)|youtu\\.be/)([A-Za-z0-9_-]{11})"
    );

    private String extractVideoId(String url) {
        Matcher matcher = YOUTUBE_ID_PATTERN.matcher(url);
        if (matcher.find()) return matcher.group(1);
        throw new IllegalArgumentException("Invalid YouTube URL: " + url);
    }

    // ---------------------------------------------------------------
    // CRUD — all scoped to the student identified by their email
    // ---------------------------------------------------------------

    /** Create a new personal lecture for the given student */
    public StudentVideoLectureResponse createLecture(VideoLectureRequest request, String studentEmail) {
        User student = getStudent(studentEmail);
        String videoId = extractVideoId(request.getYoutubeUrl());

        StudentVideoLecture lecture = StudentVideoLecture.builder()
                .student(student)
                .title(request.getTitle())
                .description(request.getDescription())
                .youtubeUrl(request.getYoutubeUrl())
                .youtubeVideoId(videoId)
                .topic(request.getTopic())
                .orderIndex(request.getOrderIndex() != null ? request.getOrderIndex() : 0)
                .resourceLinks(request.getResourceLinks() != null ? request.getResourceLinks() : new ArrayList<>())
                .build();

        return toResponse(studentLectureRepository.save(lecture));
    }

    /** Update an existing lecture — only the owner may do this */
    public StudentVideoLectureResponse updateLecture(Long id, VideoLectureRequest request, String studentEmail) {
        User student = getStudent(studentEmail);
        StudentVideoLecture lecture = studentLectureRepository.findByIdAndStudent(id, student)
                .orElseThrow(() -> new RuntimeException("Lecture not found or not owned by you: " + id));

        String videoId = extractVideoId(request.getYoutubeUrl());
        lecture.setTitle(request.getTitle());
        lecture.setDescription(request.getDescription());
        lecture.setYoutubeUrl(request.getYoutubeUrl());
        lecture.setYoutubeVideoId(videoId);
        lecture.setTopic(request.getTopic());
        if (request.getOrderIndex() != null) lecture.setOrderIndex(request.getOrderIndex());
        lecture.setResourceLinks(request.getResourceLinks() != null ? request.getResourceLinks() : new ArrayList<>());

        return toResponse(studentLectureRepository.save(lecture));
    }

    /** Delete — only the owner may do this */
    public void deleteLecture(Long id, String studentEmail) {
        User student = getStudent(studentEmail);
        StudentVideoLecture lecture = studentLectureRepository.findByIdAndStudent(id, student)
                .orElseThrow(() -> new RuntimeException("Lecture not found or not owned by you: " + id));
        studentLectureRepository.delete(lecture);
    }

    /** Fetch all lectures belonging to the given student */
    public List<StudentVideoLectureResponse> getMyLectures(String studentEmail) {
        User student = getStudent(studentEmail);
        return studentLectureRepository.findAllByStudentOrderByOrderIndexAsc(student)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    /**
     * Upsert watch progress for student's personal lecture.
     * Only updates if the new pct is strictly greater than the stored one.
     */
    public void updateProgress(Long id, int pct, String studentEmail) {
        User student = getStudent(studentEmail);
        StudentVideoLecture lecture = studentLectureRepository.findByIdAndStudent(id, student)
                .orElseThrow(() -> new RuntimeException("Lecture not found or not owned by you: " + id));

        if (pct > lecture.getProgressPct()) {
            lecture.setProgressPct(pct);
            lecture.setCompleted(pct >= 90);
            studentLectureRepository.save(lecture);
        }
    }

    /**
     * Returns map of lectureId → progressPct for student's personal lectures.
     */
    public Map<Long, Integer> getProgressMap(String studentEmail) {
        User student = getStudent(studentEmail);
        return studentLectureRepository.findAllByStudentOrderByOrderIndexAsc(student)
                .stream()
                .collect(Collectors.toMap(
                        StudentVideoLecture::getId,
                        StudentVideoLecture::getProgressPct
                ));
    }

    // ---------------------------------------------------------------
    // Internal helpers
    // ---------------------------------------------------------------

    private User getStudent(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) throw new RuntimeException("User not found: " + email);
        return user;
    }

    private StudentVideoLectureResponse toResponse(StudentVideoLecture lecture) {
        return StudentVideoLectureResponse.builder()
                .id(lecture.getId())
                .title(lecture.getTitle())
                .description(lecture.getDescription())
                .youtubeUrl(lecture.getYoutubeUrl())
                .youtubeVideoId(lecture.getYoutubeVideoId())
                .topic(lecture.getTopic())
                .orderIndex(lecture.getOrderIndex())
                .resourceLinks(lecture.getResourceLinks() != null ? lecture.getResourceLinks() : new ArrayList<>())
                .createdAt(lecture.getCreatedAt())
                .studentOwned(true)
                .progressPct(lecture.getProgressPct())
                .completed(lecture.isCompleted())
                .build();
    }
}
