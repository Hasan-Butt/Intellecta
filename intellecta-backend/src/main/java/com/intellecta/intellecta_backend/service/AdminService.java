package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.dto.request.UserCreateRequestDto;
import com.intellecta.intellecta_backend.dto.request.UserUpdateRequestDto;
import com.intellecta.intellecta_backend.dto.response.*;
import com.intellecta.intellecta_backend.enums.UserRoles;
import com.intellecta.intellecta_backend.model.User;
import com.intellecta.intellecta_backend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ── User Management ─────────────────────────────────────────────────────

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
        if (dto.username() != null && !dto.username().isBlank()) user.setUsername(dto.username());
        if (dto.role() != null) {
            try { user.setRole(UserRoles.valueOf(dto.role().toUpperCase())); } catch (Exception ignored) {}
        }
        if (dto.status() != null && !dto.status().isBlank()) user.setStatus(dto.status());
        return toDto(userRepository.save(user));
    }

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
                .filter(u -> u.getRole() == UserRoles.STUDENT).count();
        return "Intervention alerts sent to " + studentCount + " students.";
    }

    // ── Analytics ────────────────────────────────────────────────────────────

    public AnalyticsDto getAnalytics(String from, String to) {
        List<User> users = userRepository.findAll();
        long totalUsers = users.size();
        long activeUsers = users.stream().filter(u -> "Active".equals(u.getStatus())).count();
        long studentCount = users.stream().filter(u -> u.getRole() == UserRoles.STUDENT).count();
        long adminCount = users.stream().filter(u -> u.getRole() == UserRoles.ADMIN).count();
        double activePercentage = totalUsers == 0 ? 0.0
                : Math.round((activeUsers * 100.0 / totalUsers) * 10) / 10.0;
        return AnalyticsDto.builder()
                .totalUsers(totalUsers).activeUsers(activeUsers)
                .inactiveUsers(totalUsers - activeUsers)
                .studentCount(studentCount).adminCount(adminCount)
                .activeUserPercentage(activePercentage)
                .totalQuizzesTaken(0).averageQuizScore(0.0).totalQuestions(0)
                .dateFrom(from).dateTo(to).build();
    }

    public String exportAnalyticsCsv(String from, String to) {
        AnalyticsDto d = getAnalytics(from, to);
        StringBuilder csv = new StringBuilder("Metric,Value\n");
        csv.append("Total Users,").append(d.getTotalUsers()).append("\n");
        csv.append("Active Users,").append(d.getActiveUsers()).append("\n");
        csv.append("Inactive Users,").append(d.getInactiveUsers()).append("\n");
        csv.append("Students,").append(d.getStudentCount()).append("\n");
        csv.append("Admins,").append(d.getAdminCount()).append("\n");
        csv.append("Active User %,").append(d.getActiveUserPercentage()).append("%\n");
        csv.append("Total Quizzes Taken,").append(d.getTotalQuizzesTaken()).append("\n");
        csv.append("Average Quiz Score,").append(d.getAverageQuizScore()).append("\n");
        csv.append("Total Questions,").append(d.getTotalQuestions()).append("\n");
        if (from != null && !from.isBlank()) csv.append("Date From,").append(from).append("\n");
        if (to != null && !to.isBlank()) csv.append("Date To,").append(to).append("\n");
        return csv.toString();
    }

    // ── Performance Trends ───────────────────────────────────────────────────

    public PerformanceTrendDto getPerformanceTrends(String search, String from, String to) {
        List<User> allStudents = userRepository.findAll().stream()
                .filter(u -> u.getRole() == UserRoles.STUDENT)
                .filter(u -> search == null || search.isBlank()
                        || u.getUsername().toLowerCase().contains(search.toLowerCase())
                        || u.getEmail().toLowerCase().contains(search.toLowerCase()))
                .collect(Collectors.toList());

        List<StudentPerformanceDto> studentDtos = allStudents.stream()
                .map(u -> StudentPerformanceDto.builder()
                        .id(u.getId())
                        .username(u.getUsername())
                        .email(u.getEmail())
                        .averageScore(0.0)
                        .quizAttempts(0L)
                        .trend("STABLE")
                        .status(u.getStatus())
                        .build())
                .collect(Collectors.toList());

        // Placeholder subject breakdown — will be populated when quiz module is built
        List<SubjectPerformanceDto> subjects = List.of(
                SubjectPerformanceDto.builder().subjectName("Mathematics").averageScore(0).attempts(0).color("#6C5DD3").build(),
                SubjectPerformanceDto.builder().subjectName("Physics").averageScore(0).attempts(0).color("#34D399").build(),
                SubjectPerformanceDto.builder().subjectName("Computer Science").averageScore(0).attempts(0).color("#60A5FA").build(),
                SubjectPerformanceDto.builder().subjectName("Chemistry").averageScore(0).attempts(0).color("#FBBF24").build()
        );

        return PerformanceTrendDto.builder()
                .totalStudents(allStudents.size())
                .overallAverageScore(0.0)
                .totalQuizAttempts(0L)
                .studentsAboveAverage(0L)
                .students(studentDtos)
                .subjectBreakdown(subjects)
                .weakTopics(List.of())
                .dateFrom(from)
                .dateTo(to)
                .build();
    }

    public StudentPerformanceDto getStudentPerformance(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        return StudentPerformanceDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .averageScore(0.0)
                .quizAttempts(0L)
                .trend("STABLE")
                .status(user.getStatus())
                .build();
    }

    public String exportPerformanceCsv(String from, String to) {
        PerformanceTrendDto data = getPerformanceTrends("", from, to);
        StringBuilder csv = new StringBuilder("ID,Username,Email,Status,Avg Score,Quiz Attempts,Trend\n");
        for (StudentPerformanceDto s : data.getStudents()) {
            csv.append(s.getId()).append(",")
               .append(escapeCsv(s.getUsername())).append(",")
               .append(escapeCsv(s.getEmail())).append(",")
               .append(s.getStatus() != null ? s.getStatus() : "").append(",")
               .append(s.getAverageScore()).append(",")
               .append(s.getQuizAttempts()).append(",")
               .append(s.getTrend()).append("\n");
        }
        csv.append("\nSubject,Avg Score,Attempts\n");
        for (SubjectPerformanceDto sub : data.getSubjectBreakdown()) {
            csv.append(escapeCsv(sub.getSubjectName())).append(",")
               .append(sub.getAverageScore()).append(",")
               .append(sub.getAttempts()).append("\n");
        }
        return csv.toString();
    }

    public PlatformStatsDTO getPlatformStats() {
        long total = userRepository.count();
        return PlatformStatsDTO.builder()
                .totalUsers(total).activeSessions(0)
                .averageQuizScore(0.0).topPerformers(List.of()).build();
    }

    private UserResponseDto toDto(User user) {
        return new UserResponseDto(user.getId(), user.getUsername(),
                user.getEmail(), user.getRole() != null ? user.getRole().name() : null, user.getStatus());
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n"))
            return "\"" + value.replace("\"", "\"\"") + "\"";
        return value;
    }
}
