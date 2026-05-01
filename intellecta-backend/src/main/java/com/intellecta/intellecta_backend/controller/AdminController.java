package com.intellecta.intellecta_backend.controller;

import com.intellecta.intellecta_backend.dto.request.UserCreateRequestDto;
import com.intellecta.intellecta_backend.dto.request.UserUpdateRequestDto;
import com.intellecta.intellecta_backend.dto.response.*;
import com.intellecta.intellecta_backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // ── User Management ──────────────────────────────────────────────────────

    @GetMapping("/users")
    public ResponseEntity<Page<UserResponseDto>> getUsers(
            @RequestParam(required = false, defaultValue = "") String search,
            Pageable pageable) {
        return ResponseEntity.ok(adminService.getAllUsers(search, pageable));
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody UserCreateRequestDto dto) {
        try {
            return ResponseEntity.ok(adminService.createUser(dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UserUpdateRequestDto dto) {
        try {
            return ResponseEntity.ok(adminService.updateUser(id, dto));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            adminService.deleteUser(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/users/export")
    public ResponseEntity<byte[]> exportUsers() {
        return csvResponse(adminService.exportUsersCsv(), "users.csv");
    }

    @PostMapping("/interventions")
    public ResponseEntity<Map<String, String>> triggerIntervention() {
        return ResponseEntity.ok(Map.of("message", adminService.triggerIntervention()));
    }

    // ── Analytics ────────────────────────────────────────────────────────────

    @GetMapping("/analytics")
    public ResponseEntity<AnalyticsDto> getAnalytics(
            @RequestParam(required = false, defaultValue = "") String from,
            @RequestParam(required = false, defaultValue = "") String to) {
        return ResponseEntity.ok(adminService.getAnalytics(from, to));
    }

    @GetMapping("/analytics/export")
    public ResponseEntity<byte[]> exportAnalytics(
            @RequestParam(required = false, defaultValue = "") String from,
            @RequestParam(required = false, defaultValue = "") String to) {
        return csvResponse(adminService.exportAnalyticsCsv(from, to), "analytics.csv");
    }

    // ── Performance Trends ───────────────────────────────────────────────────

    @GetMapping("/performance")
    public ResponseEntity<PerformanceTrendDto> getPerformanceTrends(
            @RequestParam(required = false, defaultValue = "") String search,
            @RequestParam(required = false, defaultValue = "") String from,
            @RequestParam(required = false, defaultValue = "") String to) {
        return ResponseEntity.ok(adminService.getPerformanceTrends(search, from, to));
    }

    @GetMapping("/performance/student/{id}")
    public ResponseEntity<?> getStudentPerformance(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(adminService.getStudentPerformance(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/performance/export")
    public ResponseEntity<byte[]> exportPerformance(
            @RequestParam(required = false, defaultValue = "") String from,
            @RequestParam(required = false, defaultValue = "") String to) {
        return csvResponse(adminService.exportPerformanceCsv(from, to), "performance_trends.csv");
    }

    // ── Shared helper ────────────────────────────────────────────────────────

    private ResponseEntity<byte[]> csvResponse(String csv, String filename) {
        byte[] bytes = csv.getBytes();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .contentLength(bytes.length)
                .body(bytes);
    }
}
