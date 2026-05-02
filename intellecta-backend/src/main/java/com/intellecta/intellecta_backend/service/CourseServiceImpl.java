package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.dto.request.CourseRequest;
import com.intellecta.intellecta_backend.dto.response.CourseResponse;
import com.intellecta.intellecta_backend.model.Course;
import com.intellecta.intellecta_backend.model.User;
import com.intellecta.intellecta_backend.repository.CourseRepository;
import com.intellecta.intellecta_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository   userRepository;

    @Override
    public CourseResponse createCourse(Long userId, CourseRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        Course course = Course.builder()
            .user(user)
            .courseName(request.getCourseName())
            .examDate(request.getExamDate())
            .difficulty(request.getDifficulty())
            .plannedHoursPerDay(
                request.getPlannedHoursPerDay() > 0
                    ? request.getPlannedHoursPerDay() : 2.0)
            .build();

        return toResponse(courseRepository.save(course));
    }

    @Override
    public List<CourseResponse> getCourses(Long userId) {
        return courseRepository.findByUserIdOrderByExamDateAsc(userId)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public CourseResponse updateCourse(Long userId, Long courseId, CourseRequest request) {
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found"));

        if (!course.getUser().getId().equals(userId))
            throw new RuntimeException("Access denied");

        if (request.getCourseName() != null)
            course.setCourseName(request.getCourseName());
        if (request.getExamDate() != null)
            course.setExamDate(request.getExamDate());
        if (request.getDifficulty() != null)
            course.setDifficulty(request.getDifficulty());
        if (request.getPlannedHoursPerDay() > 0)
            course.setPlannedHoursPerDay(request.getPlannedHoursPerDay());

        return toResponse(courseRepository.save(course));
    }

    @Override
    public void deleteCourse(Long userId, Long courseId) {
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found"));

        if (!course.getUser().getId().equals(userId))
            throw new RuntimeException("Access denied");

        courseRepository.delete(course);
    }

    private CourseResponse toResponse(Course c) {
        long daysLeft = c.getExamDate() != null
            ? ChronoUnit.DAYS.between(LocalDate.now(), c.getExamDate()) : -1;

        return CourseResponse.builder()
            .id(c.getId())
            .courseName(c.getCourseName())
            .examDate(c.getExamDate())
            .difficulty(c.getDifficulty())
            .plannedHoursPerDay(c.getPlannedHoursPerDay())
            .daysUntilExam(daysLeft)
            .build();
    }
}