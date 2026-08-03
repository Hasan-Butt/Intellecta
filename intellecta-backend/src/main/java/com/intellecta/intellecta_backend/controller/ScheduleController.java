package com.intellecta.intellecta_backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.intellecta.intellecta_backend.security.SecurityUtils;
import com.intellecta.intellecta_backend.dto.request.GeneratesSchedulerRequest;
import com.intellecta.intellecta_backend.dto.response.GeneratesSchedulerResponse;
import com.intellecta.intellecta_backend.service.ScheduleService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/schedule")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    // POST /api/schedule/user/{userId}/generate
    @PostMapping("/user/{userId}/generate")
    public ResponseEntity<GeneratesSchedulerResponse> generate(
        @PathVariable Long userId,
        @Valid @RequestBody GeneratesSchedulerRequest request
    ) {
        SecurityUtils.validateUser(userId);
        return ResponseEntity.ok(scheduleService.generate(userId, request));
    }
}