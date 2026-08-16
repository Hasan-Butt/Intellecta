package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.dto.request.VideoLectureRequest;
import com.intellecta.intellecta_backend.dto.response.VideoLectureResponse;
import com.intellecta.intellecta_backend.model.User;
import com.intellecta.intellecta_backend.model.VideoLecture;
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
    private final UserRepository userRepository;

    // ---------------------------------------------------------------
    // YouTube video ID extraction
    // Handles: youtube.com/watch?v=, youtu.be/, /embed/, /shorts/
    // ---------------------------------------------------------------
    private static final Pattern YOUTUBE_ID_PATTERN = Pattern.compile(
        "(?:youtube\\.com/(?:watch\\?v=|embed/|shorts/)|youtu\\.be/)([A-Za-z0-9_-]{11})"
    );

    private String extractVideoId(String url) {
        Matcher matcher = YOUTUBE_ID_PATTERN.matcher(url);
        if (matcher.find()) return matcher.group(1);
        throw new IllegalArgumentException("Invalid YouTube URL: " + url);
    }

    // ---------------------------------------------------------------
    // Admin: create
    // ---------------------------------------------------------------
    public VideoLectureResponse createLecture(VideoLectureRequest request, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail);
        if (admin == null) throw new RuntimeException("Admin not found");

        String videoId = extractVideoId(request.getYoutubeUrl());

        VideoLecture lecture = VideoLecture.builder()
                .admin(admin)
                .title(request.getTitle())
                .description(request.getDescription())
                .youtubeUrl(request.getYoutubeUrl())
                .youtubeVideoId(videoId)
                .topic(request.getTopic())
                .orderIndex(request.getOrderIndex() != null ? request.getOrderIndex() : 0)
                .published(true)
                .build();

        return toResponse(videoLectureRepository.save(lecture));
    }

    // ---------------------------------------------------------------
    // Admin: update
    // ---------------------------------------------------------------
    public VideoLectureResponse updateLecture(Long id, VideoLectureRequest request) {
        VideoLecture lecture = videoLectureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lecture not found: " + id));

        String videoId = extractVideoId(request.getYoutubeUrl());

        lecture.setTitle(request.getTitle());
        lecture.setDescription(request.getDescription());
        lecture.setYoutubeUrl(request.getYoutubeUrl());
        lecture.setYoutubeVideoId(videoId);
        lecture.setTopic(request.getTopic());
        if (request.getOrderIndex() != null) lecture.setOrderIndex(request.getOrderIndex());

        return toResponse(videoLectureRepository.save(lecture));
    }

    // ---------------------------------------------------------------
    // Admin: delete
    // ---------------------------------------------------------------
    public void deleteLecture(Long id) {
        if (!videoLectureRepository.existsById(id)) {
            throw new RuntimeException("Lecture not found: " + id);
        }
        videoLectureRepository.deleteById(id);
    }

    // ---------------------------------------------------------------
    // Admin: toggle published/draft
    // ---------------------------------------------------------------
    public VideoLectureResponse togglePublished(Long id) {
        VideoLecture lecture = videoLectureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lecture not found: " + id));
        lecture.setPublished(!lecture.isPublished());
        return toResponse(videoLectureRepository.save(lecture));
    }

    // ---------------------------------------------------------------
    // Admin: get all lectures (including drafts)
    // ---------------------------------------------------------------
    public List<VideoLectureResponse> getAllLecturesAdmin() {
        return videoLectureRepository.findAllByOrderByOrderIndexAsc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ---------------------------------------------------------------
    // Student: get all published lectures
    // ---------------------------------------------------------------
    public List<VideoLectureResponse> getAllLecturesStudent() {
        return videoLectureRepository.findAllByPublishedTrueOrderByOrderIndexAsc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ---------------------------------------------------------------
    // Shared: single lecture by ID
    // ---------------------------------------------------------------
    public VideoLectureResponse getLectureById(Long id) {
        return toResponse(videoLectureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lecture not found: " + id)));
    }

    // ---------------------------------------------------------------
    // Entity → DTO
    // ---------------------------------------------------------------
    private VideoLectureResponse toResponse(VideoLecture lecture) {
        return VideoLectureResponse.builder()
                .id(lecture.getId())
                .title(lecture.getTitle())
                .description(lecture.getDescription())
                .youtubeUrl(lecture.getYoutubeUrl())
                .youtubeVideoId(lecture.getYoutubeVideoId())
                .topic(lecture.getTopic())
                .orderIndex(lecture.getOrderIndex())
                .published(lecture.isPublished())
                .createdAt(lecture.getCreatedAt())
                .build();
    }
}