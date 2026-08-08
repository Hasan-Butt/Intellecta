package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.dto.request.PasswordUpdateDto;
import com.intellecta.intellecta_backend.dto.request.ProfileUpdateDto;
import com.intellecta.intellecta_backend.dto.response.UserResponseDto;
import com.intellecta.intellecta_backend.model.User;
import com.intellecta.intellecta_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
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

    /**
     * Update the user's avatar URL to an UploadThing CDN URL.
     * The frontend uploads the file to UploadThing first, then calls this.
     */
    public UserResponseDto updateAvatarUrl(Long userId, String avatarUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (avatarUrl == null || avatarUrl.isBlank())
            throw new RuntimeException("avatarUrl is required");
        user.setAvatarUrl(avatarUrl);
        return toDto(userRepository.save(user));
    }

    private UserResponseDto toDto(User user) {
        return UserResponseDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
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
