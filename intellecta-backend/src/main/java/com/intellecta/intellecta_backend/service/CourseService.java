package com.intellecta.intellecta_backend.service;

import java.util.List;

import com.intellecta.intellecta_backend.dto.request.CourseRequest;
import com.intellecta.intellecta_backend.dto.response.CourseResponse;

public interface CourseService {
    CourseResponse addCourse(Long userId, CourseRequest request);
    List<CourseResponse> getCourses(Long userId);
    void deleteCourse(Long userId, Long courseId);
}