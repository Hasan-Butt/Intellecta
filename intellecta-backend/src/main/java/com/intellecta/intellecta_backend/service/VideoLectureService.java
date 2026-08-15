package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.dto.request.VideoLectureRequest;
import com.intellecta.intellecta_backend.dto.response.VideoLectureResponse;
import com.intellecta.intellecta_backend.model.Course;
import com.intellecta.intellecta_backend.model.User;
import com.intellecta.intellecta_backend.model.VideoLecture;
import com.intellecta.intellecta_backend.repository.CourseRepository;
import com.intellecta.intellecta_backend.repository.UserRepository;
import com.intellecta.intellecta_backend.repository.VideoLectureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VideoLectureService {

    private final VideoLectureRepository videoLectureRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    // ---------------------------------------------------------------
    // YouTube video ID extraction
    // Handles all common YouTube URL formats:
    //   https://www.youtube.com/watch?v=VIDEO_ID
    //   https://youtu.be/VIDEO_ID
    //   https://www.youtube.com/embed/VIDEO_ID
    //   https://www.youtube.com/shorts/VIDEO_ID
    // ---------------------------------------------------------------
    private static final Pattern YOUTUBE_ID_PATTERN = Pattern.compile(
        "(?:youtube\\.com/(?:watch\\?v=|embed/|shorts/)|youtu\\.be/)([A-Za-z0-9_-]{11})"
    );

    public String extractVideoId(String url) {
        Matcher matcher = YOUTUBE_ID_PATTERN.matcher(url);
        if (matcher.find()) {
            return matcher.group(1);
        }
        throw new IllegalArgumentException("Invalid YouTube URL: " + url);
    }

    // ---------------------------------------------------------------
    // Admin: create a lecture
    // ---------------------------------------------------------------
    public VideoLectureResponse createLecture(VideoLectureRequest request, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail);
        if (admin == null) throw new RuntimeException("Admin not found");

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found: " + request.getCourseId()));

        String videoId = extractVideoId(request.getYoutubeUrl());

        VideoLecture lecture = VideoLecture.builder()
                .admin(admin)
                .course(course)
                .title(request.getTitle())
                .description(request.getDescription())
                .youtubeUrl(request.getYoutubeUrl())
                .youtubeVideoId(videoId)
                .orderIndex(request.getOrderIndex() != null ? request.getOrderIndex() : 0)
                .published(true)
                .build();

        return toResponse(videoLectureRepository.save(lecture));
    }

    // ---------------------------------------------------------------
    // Admin: update a lecture
    // ---------------------------------------------------------------
    public VideoLectureResponse updateLecture(Long id, VideoLectureRequest request) {
        VideoLecture lecture = videoLectureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lecture not found: " + id));

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found: " + request.getCourseId()));

        String videoId = extractVideoId(request.getYoutubeUrl());

        lecture.setTitle(request.getTitle());
        lecture.setDescription(request.getDescription());
        lecture.setYoutubeUrl(request.getYoutubeUrl());
        lecture.setYoutubeVideoId(videoId);
        lecture.setCourse(course);
        if (request.getOrderIndex() != null) {
            lecture.setOrderIndex(request.getOrderIndex());
        }

        return toResponse(videoLectureRepository.save(lecture));
    }

    // ---------------------------------------------------------------
    // Admin: delete a lecture
    // ---------------------------------------------------------------
    public void deleteLecture(Long id) {
        if (!videoLectureRepository.existsById(id)) {
            throw new RuntimeException("Lecture not found: " + id);
        }
        videoLectureRepository.deleteById(id);
    }

    // ---------------------------------------------------------------
    // Admin: toggle published state
    // ---------------------------------------------------------------
    public VideoLectureResponse togglePublished(Long id) {
        VideoLecture lecture = videoLectureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lecture not found: " + id));
        lecture.setPublished(!lecture.isPublished());
        return toResponse(videoLectureRepository.save(lecture));
    }

    // ---------------------------------------------------------------
    // Admin: get all lectures for a course (published + unpublished)
    // ---------------------------------------------------------------
    public List<VideoLectureResponse> getLecturesByCourseAdmin(Long courseId) {
        return videoLectureRepository.findByCourseIdOrderByOrderIndexAsc(courseId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ---------------------------------------------------------------
    // Student: get published lectures for a course
    // ---------------------------------------------------------------
    public List<VideoLectureResponse> getLecturesByCourseStudent(Long courseId) {
        return videoLectureRepository.findByCourseIdAndPublishedTrueOrderByOrderIndexAsc(courseId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ---------------------------------------------------------------
    // Shared: get single lecture by ID
    // ---------------------------------------------------------------
    public VideoLectureResponse getLectureById(Long id) {
        return toResponse(videoLectureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lecture not found: " + id)));
    }

    // ---------------------------------------------------------------
    // Entity → Response DTO mapper
    // ---------------------------------------------------------------
    private VideoLectureResponse toResponse(VideoLecture lecture) {
        return VideoLectureResponse.builder()
                .id(lecture.getId())
                .title(lecture.getTitle())
                .description(lecture.getDescription())
                .youtubeUrl(lecture.getYoutubeUrl())
                .youtubeVideoId(lecture.getYoutubeVideoId())
                .courseId(lecture.getCourse().getId())
                .courseName(lecture.getCourse().getCourseName())
                .orderIndex(lecture.getOrderIndex())
                .published(lecture.isPublished())
                .createdAt(lecture.getCreatedAt())
                .build();
    }
}