package com.intellecta.intellecta_backend.controller;

import com.intellecta.intellecta_backend.dto.response.DashboardResponse;
import com.intellecta.intellecta_backend.service.DashboardService;
import com.intellecta.intellecta_backend.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<DashboardResponse> getDashboard(@PathVariable Long userId) {
        SecurityUtils.validateUser(userId);
        return ResponseEntity.ok(dashboardService.getDashboard(userId));
    }

    @PatchMapping("/user/{userId}/goal")
    public ResponseEntity<Void> updateDailyGoal(@PathVariable Long userId, @RequestParam double hours) {
        SecurityUtils.validateUser(userId);
        dashboardService.updateDailyGoal(userId, hours);
        return ResponseEntity.ok().build();
    }
}