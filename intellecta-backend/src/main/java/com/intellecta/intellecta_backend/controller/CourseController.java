package com.intellecta.intellecta_backend.controller;

import com.intellecta.intellecta_backend.dto.request.CourseRequest;
import com.intellecta.intellecta_backend.dto.response.CourseResponse;
import com.intellecta.intellecta_backend.service.CourseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.intellecta.intellecta_backend.security.SecurityUtils;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    // GET /api/courses/user/{userId}
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CourseResponse>> getCourses(@PathVariable Long userId) {
        SecurityUtils.validateUser(userId);
        return ResponseEntity.ok(courseService.getCourses(userId));
    }

    // POST /api/courses/user/{userId}
    @PostMapping("/user/{userId}")
    public ResponseEntity<CourseResponse> addCourse(
        @PathVariable Long userId,
        @Valid @RequestBody CourseRequest request
    ) {
        SecurityUtils.validateUser(userId);
        return ResponseEntity.ok(courseService.addCourse(userId, request));
    }

    // DELETE /api/courses/user/{userId}/{courseId}
    @DeleteMapping("/user/{userId}/{courseId}")
    public ResponseEntity<Void> deleteCourse(
        @PathVariable Long userId,
        @PathVariable Long courseId
    ) {
        SecurityUtils.validateUser(userId);
        courseService.deleteCourse(userId, courseId);
        return ResponseEntity.noContent().build();
    }
}