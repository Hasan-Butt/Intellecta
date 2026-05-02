package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.dto.request.CourseRequest;
import com.intellecta.intellecta_backend.dto.response.CourseResponse;
import java.util.List;

public interface CourseService {
    CourseResponse createCourse(Long userId, CourseRequest request);
    List<CourseResponse> getCourses(Long userId);
    CourseResponse updateCourse(Long userId, Long courseId, CourseRequest request);
    void deleteCourse(Long userId, Long courseId);
}