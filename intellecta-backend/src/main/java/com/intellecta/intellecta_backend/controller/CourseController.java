package com.intellecta.intellecta_backend.controller;

import com.intellecta.intellecta_backend.dto.request.CourseRequest;
import com.intellecta.intellecta_backend.dto.response.CourseResponse;
import com.intellecta.intellecta_backend.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @PostMapping("/user/{userId}")
    public ResponseEntity<CourseResponse> create(
        @PathVariable Long userId,
        @RequestBody CourseRequest request
    ) {
        return ResponseEntity.ok(courseService.createCourse(userId, request));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CourseResponse>> getAll(@PathVariable Long userId) {
        return ResponseEntity.ok(courseService.getCourses(userId));
    }

    @PutMapping("/user/{userId}/{courseId}")
    public ResponseEntity<CourseResponse> update(
        @PathVariable Long userId,
        @PathVariable Long courseId,
        @RequestBody CourseRequest request
    ) {
        return ResponseEntity.ok(courseService.updateCourse(userId, courseId, request));
    }

    @DeleteMapping("/user/{userId}/{courseId}")
    public ResponseEntity<Void> delete(
        @PathVariable Long userId,
        @PathVariable Long courseId
    ) {
        courseService.deleteCourse(userId, courseId);
        return ResponseEntity.noContent().build();
    }
}