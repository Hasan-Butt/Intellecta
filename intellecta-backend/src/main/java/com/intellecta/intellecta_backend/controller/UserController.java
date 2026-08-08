package com.intellecta.intellecta_backend.controller;

import com.intellecta.intellecta_backend.dto.request.PasswordUpdateDto;
import com.intellecta.intellecta_backend.dto.request.ProfileUpdateDto;
import com.intellecta.intellecta_backend.dto.response.UserResponseDto;
import com.intellecta.intellecta_backend.security.SecurityUtils;
import com.intellecta.intellecta_backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<UserResponseDto> updateProfile(@PathVariable Long id,
                                                         @RequestBody ProfileUpdateDto dto) {
        SecurityUtils.validateUser(id);
        return ResponseEntity.ok(userService.updateProfile(id, dto));
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<?> updatePassword(@PathVariable Long id,
                                             @RequestBody PasswordUpdateDto dto) {
        SecurityUtils.validateUser(id);
        try {
            userService.updatePassword(id, dto);
            return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Update avatar — now accepts a JSON body with the UploadThing CDN URL.
     * The frontend uploads the image to UploadThing first, then POSTs the URL here.
     *
     * Body: { "avatarUrl": "https://utfs.io/f/..." }
     */
    @PostMapping("/{id}/avatar")
    public ResponseEntity<UserResponseDto> updateAvatar(@PathVariable Long id,
                                                        @RequestBody Map<String, String> body) {
        SecurityUtils.validateUser(id);
        String avatarUrl = body.get("avatarUrl");
        return ResponseEntity.ok(userService.updateAvatarUrl(id, avatarUrl));
    }
}
