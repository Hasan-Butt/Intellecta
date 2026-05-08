package com.intellecta.intellecta_backend.service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.intellecta.intellecta_backend.dto.request.CourseRequest;
import com.intellecta.intellecta_backend.dto.response.CourseResponse;
import com.intellecta.intellecta_backend.model.Course;
import com.intellecta.intellecta_backend.model.User;
import com.intellecta.intellecta_backend.repository.CourseRepository;
import com.intellecta.intellecta_backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository   userRepository;

    @Override
    public CourseResponse addCourse(Long userId, CourseRequest req) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        Course course = Course.builder()
            .user(user)
            .courseName(req.getCourseName())
            .examDate(req.getExamDate())
            .difficulty(req.getDifficulty())
            .plannedHoursPerDay(req.getPlannedHoursPerDay() > 0
                ? req.getPlannedHoursPerDay() : 2.0)
            .build();

        return toResponse(courseRepository.save(course));
    }

    @Override
    public List<CourseResponse> getCourses(Long userId) {
        return courseRepository.findByUserIdOrderByExamDateAsc(userId)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public void deleteCourse(Long userId, Long courseId) {
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found: " + courseId));
        if (!course.getUser().getId().equals(userId)) {
            throw new RuntimeException("Forbidden");
        }
        courseRepository.delete(course);
    }

    private CourseResponse toResponse(Course c) {
        long daysLeft = c.getExamDate() != null
            ? ChronoUnit.DAYS.between(LocalDate.now(), c.getExamDate())
            : -1;
        return CourseResponse.builder()
            .id(c.getId())
            .courseName(c.getCourseName())
            .examDate(c.getExamDate())
            .difficulty(c.getDifficulty())
            .plannedHoursPerDay(c.getPlannedHoursPerDay())
            .daysUntilExam(daysLeft)
            .masteryPct(0)
            .build();
    }
}