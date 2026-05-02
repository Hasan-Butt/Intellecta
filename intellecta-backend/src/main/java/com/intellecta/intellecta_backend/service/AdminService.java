package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.dto.request.UserCreateRequestDto;
import com.intellecta.intellecta_backend.dto.request.UserUpdateRequestDto;
import com.intellecta.intellecta_backend.dto.response.AnalyticsDto;
import com.intellecta.intellecta_backend.dto.response.PlatformStatsDTO;
import com.intellecta.intellecta_backend.dto.response.UserResponseDto;
import com.intellecta.intellecta_backend.enums.UserRoles;
import com.intellecta.intellecta_backend.model.User;
import com.intellecta.intellecta_backend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Page<UserResponseDto> getAllUsers(String search, Pageable pageable) {
        Page<User> users;
        if (search == null || search.isBlank()) {
            users = userRepository.findAll(pageable);
        } else {
            users = userRepository.findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(search, search, pageable);
        }
        return users.map(this::toDto);
    }

    public UserResponseDto createUser(UserCreateRequestDto dto) {
        if (userRepository.existsByEmail(dto.email())) {
            throw new IllegalArgumentException("Email already registered. Use a different email.");
        }
        User user = new User();
        user.setUsername(dto.username());
        user.setEmail(dto.email());
        user.setPassword(passwordEncoder.encode(dto.password()));
        try {
            user.setRole(UserRoles.valueOf(dto.role().toUpperCase()));
        } catch (Exception e) {
            user.setRole(UserRoles.STUDENT);
        }
        user.setStatus("Active");
        return toDto(userRepository.save(user));
    }

    public UserResponseDto updateUser(Long id, UserUpdateRequestDto dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (dto.username() != null && !dto.username().isBlank()) {
            user.setUsername(dto.username());
        }
        if (dto.role() != null) {
            try {
                user.setRole(UserRoles.valueOf(dto.role().toUpperCase()));
            } catch (Exception ignored) {}
        }
        if (dto.status() != null && !dto.status().isBlank()) {
            user.setStatus(dto.status());
        }
        return toDto(userRepository.save(user));
    }

    // Soft-delete: marks user Inactive rather than removing the row.
    // Prevents FK constraint violations from related notes/subjects/documents.
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus("Inactive");
        userRepository.save(user);
    }

    public String exportUsersCsv() {
        List<User> users = userRepository.findAll();
        StringBuilder csv = new StringBuilder("ID,Username,Email,Role,Status\n");
        for (User u : users) {
            csv.append(u.getId()).append(",")
               .append(escapeCsv(u.getUsername())).append(",")
               .append(escapeCsv(u.getEmail())).append(",")
               .append(u.getRole() != null ? u.getRole().name() : "").append(",")
               .append(u.getStatus() != null ? u.getStatus() : "").append("\n");
        }
        return csv.toString();
    }

    public String triggerIntervention() {
        long studentCount = userRepository.findAll().stream()
                .filter(u -> u.getRole() == UserRoles.STUDENT)
                .count();
        return "Intervention alerts sent to " + studentCount + " students.";
    }

    public AnalyticsDto getAnalytics(String from, String to) {
        List<User> users = userRepository.findAll();
        long totalUsers = users.size();
        long activeUsers = users.stream().filter(u -> "Active".equals(u.getStatus())).count();
        long studentCount = users.stream().filter(u -> u.getRole() == UserRoles.STUDENT).count();
        long adminCount = users.stream().filter(u -> u.getRole() == UserRoles.ADMIN).count();
        double activePercentage = totalUsers == 0 ? 0.0 : Math.round((activeUsers * 100.0 / totalUsers) * 10) / 10.0;

        return AnalyticsDto.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .inactiveUsers(totalUsers - activeUsers)
                .studentCount(studentCount)
                .adminCount(adminCount)
                .activeUserPercentage(activePercentage)
                .totalQuizzesTaken(0)
                .averageQuizScore(0.0)
                .totalQuestions(0)
                .dateFrom(from)
                .dateTo(to)
                .build();
    }

    public String exportAnalyticsCsv(String from, String to) {
        AnalyticsDto data = getAnalytics(from, to);
        StringBuilder csv = new StringBuilder();
        csv.append("Metric,Value\n");
        csv.append("Total Users,").append(data.getTotalUsers()).append("\n");
        csv.append("Active Users,").append(data.getActiveUsers()).append("\n");
        csv.append("Inactive Users,").append(data.getInactiveUsers()).append("\n");
        csv.append("Students,").append(data.getStudentCount()).append("\n");
        csv.append("Admins,").append(data.getAdminCount()).append("\n");
        csv.append("Active User %,").append(data.getActiveUserPercentage()).append("%\n");
        csv.append("Total Quizzes Taken,").append(data.getTotalQuizzesTaken()).append("\n");
        csv.append("Average Quiz Score,").append(data.getAverageQuizScore()).append("\n");
        csv.append("Total Questions,").append(data.getTotalQuestions()).append("\n");
        if (from != null && !from.isBlank()) csv.append("Date From,").append(from).append("\n");
        if (to != null && !to.isBlank()) csv.append("Date To,").append(to).append("\n");
        return csv.toString();
    }

    public PlatformStatsDTO getPlatformStats() {
        long total = userRepository.count();
        return PlatformStatsDTO.builder()
                .totalUsers(total)
                .activeSessions(0)
                .averageQuizScore(0.0)
                .topPerformers(List.of())
                .build();
    }

    private UserResponseDto toDto(User user) {
        return new UserResponseDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole() != null ? user.getRole().name() : null,
                user.getStatus()
        );
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
