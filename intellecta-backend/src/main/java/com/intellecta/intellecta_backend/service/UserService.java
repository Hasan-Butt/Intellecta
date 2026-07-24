package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.dto.request.PasswordUpdateDto;
import com.intellecta.intellecta_backend.dto.request.ProfileUpdateDto;
import com.intellecta.intellecta_backend.dto.response.UserResponseDto;
import com.intellecta.intellecta_backend.model.User;
import com.intellecta.intellecta_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private final String uploadDir = "uploads/avatars";

    public UserResponseDto getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return toDto(user);
    }

    public UserResponseDto updateProfile(Long userId, ProfileUpdateDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (dto.username() != null) user.setUsername(dto.username());
        if (dto.email() != null) user.setEmail(dto.email());
        if (dto.bio() != null) user.setBio(dto.bio());
        if (dto.avatarUrl() != null) user.setAvatarUrl(dto.avatarUrl());
        if (dto.studyReminders() != null) user.setStudyReminders(dto.studyReminders());
        if (dto.achievementAlerts() != null) user.setAchievementAlerts(dto.achievementAlerts());
        if (dto.weeklyReports() != null) user.setWeeklyReports(dto.weeklyReports());
        if (dto.anonymousMode() != null) user.setAnonymousMode(dto.anonymousMode());

        return toDto(userRepository.save(user));
    }

    public void updatePassword(Long userId, PasswordUpdateDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(dto.currentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password does not match");
        }

        user.setPassword(passwordEncoder.encode(dto.newPassword()));
        userRepository.save(user);
    }

    public UserResponseDto uploadAvatar(Long userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            Path root = Paths.get(uploadDir);
            if (!Files.exists(root)) Files.createDirectories(root);

            String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Files.copy(file.getInputStream(), root.resolve(filename));

            user.setAvatarUrl("/api/users/avatar/" + filename);
            return toDto(userRepository.save(user));
        } catch (IOException e) {
            throw new RuntimeException("Could not store file: " + e.getMessage());
        }
    }

    private UserResponseDto toDto(User user) {
        return UserResponseDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .status(user.getStatus())
                .bio(user.getBio())
                .avatarUrl(user.getAvatarUrl())
                .studyReminders(user.isStudyReminders())
                .achievementAlerts(user.isAchievementAlerts())
                .weeklyReports(user.isWeeklyReports())
                .streakDays(user.getStreakDays())
                .anonymousMode(user.isAnonymousMode())
                .build();
    }
}
