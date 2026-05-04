package com.intellecta.intellecta_backend.controller;

import com.intellecta.intellecta_backend.dto.request.AddAppRuleRequestDto;
import com.intellecta.intellecta_backend.dto.request.ConfigDeployRequestDto;
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

import java.util.List;
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
    public ResponseEntity<?> updateUser(@PathVariable Long id,
                                        @RequestBody UserUpdateRequestDto dto) {
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

    @GetMapping("/users/stats")
    public ResponseEntity<?> getUserStats() {
        try {
            return ResponseEntity.ok(adminService.getUserStats());
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to load user stats: " + e.getMessage()));
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

    // ── Dashboard Overview ────────────────────────────────────────────────────

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardDto> getDashboardOverview() {
        return ResponseEntity.ok(adminService.getDashboardOverview());
    }

    @DeleteMapping("/alerts/{id}")
    public ResponseEntity<?> dismissAlert(@PathVariable Long id) {
        try {
            adminService.dismissAlert(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
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

    @GetMapping("/audit")
    public ResponseEntity<?> getAuditLogs() {
        try {
            return ResponseEntity.ok(adminService.getAuditLogs());
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to load audit logs: " + e.getMessage()));
        }
    }

    @GetMapping("/integrity")
    public ResponseEntity<?> getSystemIntegrity() {
        try {
            return ResponseEntity.ok(adminService.getSystemIntegrity());
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to load integrity: " + e.getMessage()));
        }
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

    // ── System Configuration ─────────────────────────────────────────────────

    @GetMapping("/config")
    public ResponseEntity<?> getConfig() {
        try {
            return ResponseEntity.ok(adminService.getSystemConfig());
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/config/deploy")
    public ResponseEntity<?> deployConfig(@RequestBody ConfigDeployRequestDto dto) {
        try {
            return ResponseEntity.ok(adminService.deployConfig(dto));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/config/leaderboard/reset")
    public ResponseEntity<?> forceLeaderboardReset() {
        try {
            return ResponseEntity.ok(adminService.forceLeaderboardReset());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── Application Governance ────────────────────────────────────────────────

    @GetMapping("/config/governance")
    public ResponseEntity<List<AppRuleDto>> getAppRules(
            @RequestParam(required = false, defaultValue = "") String type) {
        return ResponseEntity.ok(adminService.getAppRules(type));
    }

    @PostMapping("/config/governance")
    public ResponseEntity<?> addAppRule(@RequestBody AddAppRuleRequestDto dto) {
        try {
            return ResponseEntity.ok(adminService.addAppRule(dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/config/governance/{id}")
    public ResponseEntity<?> deleteAppRule(@PathVariable Long id) {
        try {
            adminService.deleteAppRule(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/config/governance/export")
    public ResponseEntity<byte[]> exportAppRules() {
        return csvResponse(adminService.exportAppRulesCsv(), "app_rules.csv");
    }

    // ── Moderator Status ─────────────────────────────────────────────────────

    @GetMapping("/config/moderators")
    public ResponseEntity<?> getModeratorStatus() {
        try {
            return ResponseEntity.ok(adminService.getModeratorStatus());
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", e.getMessage()));
        }
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
