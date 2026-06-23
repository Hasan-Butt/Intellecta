package com.intellecta.intellecta_backend.controller;

import com.intellecta.intellecta_backend.dto.request.PasswordUpdateDto;
import com.intellecta.intellecta_backend.dto.request.ProfileUpdateDto;
import com.intellecta.intellecta_backend.dto.response.UserResponseDto;
import com.intellecta.intellecta_backend.security.SecurityUtils;
import com.intellecta.intellecta_backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}/profile")
    public ResponseEntity<UserResponseDto> getProfile(@PathVariable Long id) {
        SecurityUtils.validateUser(id);
        return ResponseEntity.ok(userService.getProfile(id));
    }

    @PutMapping("/{id}/profile")
    public ResponseEntity<UserResponseDto> updateProfile(@PathVariable Long id, @RequestBody ProfileUpdateDto dto) {
        SecurityUtils.validateUser(id);
        return ResponseEntity.ok(userService.updateProfile(id, dto));
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<?> updatePassword(@PathVariable Long id, @RequestBody PasswordUpdateDto dto) {
        SecurityUtils.validateUser(id);
        try {
            userService.updatePassword(id, dto);
            return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/avatar")
    public ResponseEntity<UserResponseDto> uploadAvatar(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        SecurityUtils.validateUser(id);
        return ResponseEntity.ok(userService.uploadAvatar(id, file));
    }

    @GetMapping("/avatar/{filename:.+}")
    public ResponseEntity<Resource> getAvatar(@PathVariable String filename) {
        Path filePath = Paths.get("uploads/avatars").resolve(filename);
        Resource resource = new FileSystemResource(filePath);
        if (!resource.exists()) return ResponseEntity.notFound().build();
        
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG) // Or detect from extension
                .body(resource);
    }
}
