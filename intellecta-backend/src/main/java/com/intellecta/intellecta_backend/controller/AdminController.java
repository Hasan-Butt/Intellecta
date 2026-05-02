package com.intellecta.intellecta_backend.controller;

import com.intellecta.intellecta_backend.dto.request.UserCreateRequestDto;
import com.intellecta.intellecta_backend.dto.request.UserUpdateRequestDto;
import com.intellecta.intellecta_backend.dto.response.PlatformStatsDTO;
import com.intellecta.intellecta_backend.dto.response.UserResponseDto;
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
        String csv = adminService.exportUsersCsv();
        byte[] bytes = csv.getBytes();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"users.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .contentLength(bytes.length)
                .body(bytes);
    }

    @PostMapping("/interventions")
    public ResponseEntity<Map<String, String>> triggerIntervention() {
        String message = adminService.triggerIntervention();
        return ResponseEntity.ok(Map.of("message", message));
    }

    @GetMapping("/analytics")
    public ResponseEntity<PlatformStatsDTO> getAnalytics() {
        return ResponseEntity.ok(adminService.getPlatformStats());
    }
}
