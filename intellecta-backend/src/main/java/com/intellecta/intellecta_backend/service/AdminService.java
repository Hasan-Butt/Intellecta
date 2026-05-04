package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.dto.request.AddAppRuleRequestDto;
import com.intellecta.intellecta_backend.dto.request.ConfigDeployRequestDto;
import com.intellecta.intellecta_backend.dto.request.UserCreateRequestDto;
import com.intellecta.intellecta_backend.dto.request.UserUpdateRequestDto;
import com.intellecta.intellecta_backend.dto.response.*;
import com.intellecta.intellecta_backend.enums.UserRoles;
import com.intellecta.intellecta_backend.model.*;
import com.intellecta.intellecta_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository              userRepository;
    private final PasswordEncoder             passwordEncoder;
    private final StudySessionRepository      studySessionRepository;
    private final SystemAlertRepository       systemAlertRepository;
    private final QuizAttemptRepository       quizAttemptRepository;
    private final SystemConfigRepository      systemConfigRepository;
    private final AppGovernanceRuleRepository appGovernanceRuleRepository;
    private final DistractionRepository       distractionRepository;

    // ── User Management ──────────────────────────────────────────────────────

    public Page<UserResponseDto> getAllUsers(String search, Pageable pageable) {
        Page<User> users;
        if (search == null || search.isBlank()) {
            users = userRepository.findAll(pageable);
        } else {
            users = userRepository.findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                    search, search, pageable);
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

    // ── User Stats ────────────────────────────────────────────────────────────

    public UserStatsDto getUserStats() {
        List<User> all = userRepository.findAll();
        long totalStudents = all.stream().filter(u -> u.getRole() == UserRoles.STUDENT).count();
        long totalActiveStudents = all.stream()
                .filter(u -> u.getRole() == UserRoles.STUDENT && "Active".equals(u.getStatus())).count();
        long totalAdmins = all.stream().filter(u -> u.getRole() == UserRoles.ADMIN).count();

        List<StudySession> sessions = studySessionRepository.findAll();
        OptionalDouble avgOpt = sessions.stream()
                .filter(s -> s.getStartTime() != null && s.getEndTime() != null)
                .mapToDouble(s -> Math.min(10.0, sessionMinutes(s) / 12.0))
                .average();
        double avgFocusScore = avgOpt.isPresent() ? Math.round(avgOpt.getAsDouble() * 10) / 10.0 : 0.0;

        // Downward trend students (quiz-based)
        long downwardTrend = all.stream()
                .filter(u -> u.getRole() == UserRoles.STUDENT)
                .filter(u -> "DOWN".equals(computeTrend(quizAttemptRepository.findByUserId(u.getId()))))
                .count();

        // Week-over-week session activity
        LocalDateTime thisWeekStart = LocalDate.now().minusDays(6).atStartOfDay();
        LocalDateTime lastWeekStart = LocalDate.now().minusDays(13).atStartOfDay();
        long thisWeekSessions = sessions.stream()
                .filter(s -> s.getStartTime() != null && !s.getStartTime().isBefore(thisWeekStart))
                .count();
        long lastWeekSessions = sessions.stream()
                .filter(s -> s.getStartTime() != null
                        && !s.getStartTime().isBefore(lastWeekStart)
                        && s.getStartTime().isBefore(thisWeekStart))
                .count();

        long diff = thisWeekSessions - lastWeekSessions;
        String userGrowthLabel = diff > 0 ? "+" + diff + " sessions" : diff < 0 ? diff + " sessions" : "Same as last week";

        String focusTrendLabel = avgFocusScore >= 7.0 ? "High focus" : avgFocusScore >= 4.0 ? "Moderate" : "Low engagement";

        String sessionTrendLabel = thisWeekSessions > lastWeekSessions * 1.1 ? "Increasing"
                : thisWeekSessions < lastWeekSessions * 0.9 ? "Decreasing" : "Stable";

        // DB latency probe
        long t0 = System.currentTimeMillis();
        userRepository.count();
        String dbLatency = (System.currentTimeMillis() - t0) + "ms";

        // Storage proxy: total records / cap
        long totalRecords = sessions.size() + all.size() + quizAttemptRepository.count();
        int storageCapacity = (int) Math.min((totalRecords / 8) + 5, 92);

        // Last maintenance from system config
        SystemConfig cfg = systemConfigRepository.findFirstBy().orElse(null);
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM d, yyyy 'at' hh:mm a");
        String lastMaintenance = (cfg != null && cfg.getLastDeployedAt() != null)
                ? cfg.getLastDeployedAt().format(fmt) : "Not recorded";

        return UserStatsDto.builder()
                .totalStudents(totalStudents)
                .totalActiveUsers(totalActiveStudents)
                .totalAdmins(totalAdmins)
                .avgFocusScore(avgFocusScore)
                .downwardTrendStudents(downwardTrend)
                .userGrowthLabel(userGrowthLabel)
                .focusTrendLabel(focusTrendLabel)
                .sessionTrendLabel(sessionTrendLabel)
                .syncStatus("Active")
                .dbLatency(dbLatency)
                .storageCapacity(storageCapacity + "%")
                .lastMaintenance(lastMaintenance)
                .build();
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

        List<QuizAttempt> allAttempts = quizAttemptRepository.findAll();
        long totalQuizzesTaken = allAttempts.size();
        double avgQuizScore = allAttempts.stream()
                .filter(a -> a.getTotalQuestions() != null && a.getTotalQuestions() > 0 && a.getScore() != null)
                .mapToDouble(a -> (double) a.getScore() / a.getTotalQuestions() * 100)
                .average().orElse(0.0);
        long totalQuestionsAnswered = allAttempts.stream()
                .filter(a -> a.getTotalQuestions() != null)
                .mapToLong(QuizAttempt::getTotalQuestions)
                .sum();

        // Focus history — session count per 10-week window, normalized to 0-100
        List<StudySession> allSessions = studySessionRepository.findAll();
        List<Long> weeklyCounts = new ArrayList<>();
        for (int w = 9; w >= 0; w--) {
            LocalDateTime ws = LocalDate.now().minusWeeks(w + 1).atStartOfDay();
            LocalDateTime we = LocalDate.now().minusWeeks(w).atStartOfDay();
            long cnt = allSessions.stream()
                    .filter(s -> s.getStartTime() != null
                            && !s.getStartTime().isBefore(ws)
                            && s.getStartTime().isBefore(we))
                    .count();
            weeklyCounts.add(cnt);
        }
        long maxWeekly = weeklyCounts.stream().mapToLong(Long::longValue).max().orElse(1L);
        List<Double> focusHistory = weeklyCounts.stream()
                .map(c -> maxWeekly == 0 ? 0.0 : Math.round((c * 100.0 / maxWeekly) * 10) / 10.0)
                .collect(Collectors.toList());

        // Distractions per hour (avg distractions per completed-session-hour)
        List<com.intellecta.intellecta_backend.model.DistractionEntry> allDistractions =
                distractionRepository.findAll();
        long completedSessions = allSessions.stream().filter(s -> s.getEndTime() != null).count();
        double avgMinPerSession = allSessions.stream()
                .filter(s -> s.getStartTime() != null && s.getEndTime() != null)
                .mapToLong(this::sessionMinutes)
                .average().orElse(60.0);
        double avgHoursPerSession = Math.max(avgMinPerSession / 60.0, 0.01);
        double distractionsPerHour = completedSessions == 0 ? 0.0
                : Math.round(((double) allDistractions.size() / completedSessions / avgHoursPerSession) * 10) / 10.0;

        // Distraction trend based on rate
        String distractionTrend = distractionsPerHour < 1.5 ? "Decreasing Trend"
                : distractionsPerHour < 4.0 ? "Stable Trend" : "Increasing Trend";

        // Distraction sources — categorize by reason keyword
        Map<String, Long> categoryCounts = allDistractions.stream()
                .filter(d -> d.getReason() != null)
                .collect(Collectors.groupingBy(d -> categorizeDistraction(d.getReason()), Collectors.counting()));
        long totalDist = Math.max(allDistractions.size(), 1);
        List<DistractionSourceDto> distractionSources = categoryCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(4)
                .map(e -> DistractionSourceDto.builder()
                        .label(e.getKey())
                        .percentage((int) Math.round(e.getValue() * 100.0 / totalDist))
                        .build())
                .collect(Collectors.toList());
        if (distractionSources.isEmpty()) {
            distractionSources = List.of(DistractionSourceDto.builder().label("No data").percentage(0).build());
        }

        return AnalyticsDto.builder()
                .totalUsers(totalUsers).activeUsers(activeUsers)
                .inactiveUsers(totalUsers - activeUsers)
                .studentCount(studentCount).adminCount(adminCount)
                .activeUserPercentage(activePercentage)
                .totalQuizzesTaken(totalQuizzesTaken)
                .averageQuizScore(Math.round(avgQuizScore * 10) / 10.0)
                .totalQuestions(totalQuestionsAnswered)
                .focusHistory(focusHistory)
                .distractionsPerHour(distractionsPerHour)
                .distractionTrend(distractionTrend)
                .distractionSources(distractionSources)
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
        csv.append("Average Quiz Score,").append(d.getAverageQuizScore()).append("%\n");
        csv.append("Total Questions Answered,").append(d.getTotalQuestions()).append("\n");
        csv.append("Distractions Per Hour,").append(d.getDistractionsPerHour()).append("\n");
        if (from != null && !from.isBlank()) csv.append("Date From,").append(from).append("\n");
        if (to != null && !to.isBlank()) csv.append("Date To,").append(to).append("\n");
        return csv.toString();
    }

    // ── Audit Logs ────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AuditLogDto> getAuditLogs() {
        return studySessionRepository.findAll().stream()
                .filter(s -> s.getStartTime() != null)
                .sorted(Comparator.comparing(StudySession::getStartTime).reversed())
                .limit(15)
                .map(s -> {
                    String username;
                    try { username = s.getUser() != null ? s.getUser().getUsername() : "unknown"; }
                    catch (Exception e) { username = "unknown"; }

                    boolean active = s.getEndTime() == null;
                    String event = (active ? "Focus Session — " :
                            (s.isDeepWork() ? "Deep Work — " : "Study Session — ")) + s.getSubject();
                    String status = active ? "IN_PROGRESS"
                            : s.getDurationMinutes() >= 60 ? "COMPLETED" : "LOGGED";
                    String ts = s.getStartTime().toLocalTime()
                            .format(DateTimeFormatter.ofPattern("HH:mm:ss"));

                    return AuditLogDto.builder()
                            .timestamp(ts)
                            .userId("u_" + username.toLowerCase().replace(" ", "_"))
                            .event(event)
                            .status(status)
                            .build();
                })
                .collect(Collectors.toList());
    }

    // ── System Integrity ─────────────────────────────────────────────────────

    public SystemIntegrityDto getSystemIntegrity() {
        List<User> users = userRepository.findAll();
        long totalUsers = users.size();
        long activeUsers = users.stream().filter(u -> "Active".equals(u.getStatus())).count();

        List<StudySession> allSessions = studySessionRepository.findAll();
        long totalSessions = allSessions.size();
        long concurrentSessions = allSessions.stream()
                .filter(s -> s.getEndTime() == null).count();

        List<QuizAttempt> allAttempts = quizAttemptRepository.findAll();
        long completedAttempts = allAttempts.stream()
                .filter(a -> "COMPLETED".equalsIgnoreCase(a.getStatus())).count();
        double quizCompletionRate = allAttempts.isEmpty() ? 100.0
                : Math.round((completedAttempts * 100.0 / allAttempts.size()) * 10) / 10.0;

        int systemLoad = (int) Math.min((concurrentSessions * 8) + (totalSessions / 20) + 3, 95);

        int score = 100;
        if (totalUsers > 0 && activeUsers < totalUsers / 2) score -= 5;
        if (!allAttempts.isEmpty() && quizCompletionRate < 60) score -= 10;
        if (concurrentSessions == 0) score = Math.min(score, 92);
        score = Math.max(score, 78);

        String nodeStatus = concurrentSessions > 0
                ? concurrentSessions + " active session" + (concurrentSessions > 1 ? "s" : "") + " in progress"
                : "All systems operational";

        return SystemIntegrityDto.builder()
                .integrityScore(score)
                .systemLoad(systemLoad)
                .nodeStatus(nodeStatus)
                .totalSessions(totalSessions)
                .concurrentSessions(concurrentSessions)
                .quizCompletionRate(quizCompletionRate)
                .activeUsers(activeUsers)
                .totalUsers(totalUsers)
                .build();
    }

    // ── Performance Trends ───────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public PerformanceTrendDto getPerformanceTrends(String search, String from, String to) {
        List<User> allStudents = userRepository.findAll().stream()
                .filter(u -> u.getRole() == UserRoles.STUDENT)
                .filter(u -> search == null || search.isBlank()
                        || u.getUsername().toLowerCase().contains(search.toLowerCase())
                        || u.getEmail().toLowerCase().contains(search.toLowerCase()))
                .collect(Collectors.toList());

        List<QuizAttempt> allAttempts = quizAttemptRepository.findAll();

        // Group attempts by user ID for O(1) lookup
        Map<Long, List<QuizAttempt>> attemptsByUser = allAttempts.stream()
                .filter(a -> a.getUser() != null)
                .collect(Collectors.groupingBy(a -> a.getUser().getId()));

        List<StudentPerformanceDto> studentDtos = allStudents.stream()
                .map(u -> {
                    List<QuizAttempt> attempts = attemptsByUser.getOrDefault(u.getId(), List.of());
                    double avg = Math.round(computeAvgScore(attempts) * 10) / 10.0;
                    List<Double> scoreHistory = buildScoreHistory(attempts);
                    return StudentPerformanceDto.builder()
                            .id(u.getId()).username(u.getUsername()).email(u.getEmail())
                            .averageScore(avg).quizAttempts((long) attempts.size())
                            .trend(computeTrend(attempts)).status(u.getStatus())
                            .scoreHistory(scoreHistory)
                            .build();
                })
                .collect(Collectors.toList());

        double overallAvg = studentDtos.stream()
                .mapToDouble(StudentPerformanceDto::getAverageScore).average().orElse(0.0);
        long totalAttempts = studentDtos.stream()
                .mapToLong(StudentPerformanceDto::getQuizAttempts).sum();
        long studentsAboveAverage = studentDtos.stream()
                .filter(s -> s.getAverageScore() > overallAvg).count();

        // Subject breakdown from study sessions
        List<StudySession> allSessions = studySessionRepository.findAll();
        Map<String, Long> minutesBySubject = allSessions.stream()
                .filter(s -> s.getSubject() != null && s.getStartTime() != null && s.getEndTime() != null)
                .collect(Collectors.groupingBy(StudySession::getSubject,
                        Collectors.summingLong(s -> Duration.between(s.getStartTime(), s.getEndTime()).toMinutes())));
        Map<String, Long> countBySubject = allSessions.stream()
                .filter(s -> s.getSubject() != null)
                .collect(Collectors.groupingBy(StudySession::getSubject, Collectors.counting()));

        long totalMinutes = minutesBySubject.values().stream().mapToLong(Long::longValue).sum();
        String[] colors = {"#6C5DD3", "#34D399", "#60A5FA", "#FBBF24", "#F87171"};
        int ci = 0;
        List<SubjectPerformanceDto> subjects = new ArrayList<>();
        for (Map.Entry<String, Long> entry : minutesBySubject.entrySet()) {
            double pct = totalMinutes == 0 ? 0.0
                    : Math.round((entry.getValue() * 100.0 / totalMinutes) * 10) / 10.0;
            subjects.add(SubjectPerformanceDto.builder()
                    .subjectName(entry.getKey())
                    .averageScore(pct)
                    .attempts(countBySubject.getOrDefault(entry.getKey(), 0L))
                    .color(colors[ci++ % colors.length])
                    .build());
        }
        if (subjects.isEmpty()) {
            subjects = List.of(SubjectPerformanceDto.builder()
                    .subjectName("No data").averageScore(0).attempts(0).color("#E5E7EB").build());
        }

        // Performance over time — last 7 months
        List<MonthlyScoreDto> performanceOverTime = new ArrayList<>();
        for (int m = 6; m >= 0; m--) {
            YearMonth ym = YearMonth.now().minusMonths(m);
            LocalDateTime monthStart = ym.atDay(1).atStartOfDay();
            LocalDateTime monthEnd   = ym.atEndOfMonth().atTime(23, 59, 59);
            OptionalDouble monthAvg = allAttempts.stream()
                    .filter(a -> a.getStartTime() != null
                            && !a.getStartTime().isBefore(monthStart)
                            && !a.getStartTime().isAfter(monthEnd)
                            && a.getScore() != null
                            && a.getTotalQuestions() != null
                            && a.getTotalQuestions() > 0)
                    .mapToDouble(a -> (double) a.getScore() / a.getTotalQuestions() * 100)
                    .average();
            performanceOverTime.add(MonthlyScoreDto.builder()
                    .month(ym.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH))
                    .score(monthAvg.isPresent() ? Math.round(monthAvg.getAsDouble() * 10) / 10.0 : 0.0)
                    .build());
        }

        // Weak topics computation
        System.out.println("[WEAK_TOPICS_DEBUG] allAttempts.size()=" + allAttempts.size());
        int skipped = 0;
        if (!allAttempts.isEmpty()) {
            QuizAttempt sample = allAttempts.get(0);
            System.out.println("[WEAK_TOPICS_DEBUG] sample score=" + sample.getScore()
                    + " totalQ=" + sample.getTotalQuestions()
                    + " quiz=" + (sample.getQuiz() != null ? sample.getQuiz().getTopic() : "null"));
        }
        Map<String, List<Double>> scoresByTopic = new HashMap<>();
        for (QuizAttempt a : allAttempts) {
            if (a.getScore() == null || a.getTotalQuestions() == null || a.getTotalQuestions() == 0) { skipped++; continue; }
            String topic;
            try {
                String cat   = (a.getQuiz() != null) ? a.getQuiz().getCategory() : null;
                String title = (a.getQuiz() != null) ? a.getQuiz().getTopic()    : null;
                topic = (cat != null && !cat.isBlank()) ? cat
                      : (title != null && !title.isBlank()) ? title
                      : "General";
            } catch (Exception e) {
                topic = "General";
            }
            double pct = (double) a.getScore() / a.getTotalQuestions() * 100;
            scoresByTopic.computeIfAbsent(topic, k -> new ArrayList<>()).add(pct);
        }
        // DEBUG response: encode diagnostic info directly in the list
        List<String> weakTopics = new ArrayList<>();
        weakTopics.add("allAttempts=" + allAttempts.size() + " skipped=" + skipped + " topics=" + scoresByTopic.size());
        for (Map.Entry<String, List<Double>> e : scoresByTopic.entrySet()) {
            double avg = e.getValue().stream().mapToDouble(Double::doubleValue).average().orElse(-1);
            weakTopics.add(e.getKey() + ": avg=" + Math.round(avg) + "% n=" + e.getValue().size());
        }

        return PerformanceTrendDto.builder()
                .totalStudents(allStudents.size())
                .overallAverageScore(Math.round(overallAvg * 10) / 10.0)
                .totalQuizAttempts(totalAttempts)
                .studentsAboveAverage(studentsAboveAverage)
                .students(studentDtos)
                .subjectBreakdown(subjects)
                .weakTopics(weakTopics)
                .performanceOverTime(performanceOverTime)
                .dateFrom(from).dateTo(to)
                .build();
    }

    public StudentPerformanceDto getStudentPerformance(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        List<QuizAttempt> attempts = quizAttemptRepository.findByUserId(id);
        List<Double> scoreHistory = buildScoreHistory(attempts);
        return StudentPerformanceDto.builder()
                .id(user.getId()).username(user.getUsername()).email(user.getEmail())
                .averageScore(Math.round(computeAvgScore(attempts) * 10) / 10.0)
                .quizAttempts((long) attempts.size())
                .trend(computeTrend(attempts)).status(user.getStatus())
                .scoreHistory(scoreHistory)
                .build();
    }

    public String exportPerformanceCsv(String from, String to) {
        PerformanceTrendDto data = getPerformanceTrends("", from, to);
        StringBuilder csv = new StringBuilder("ID,Username,Email,Status,Avg Score (%),Quiz Attempts,Trend\n");
        for (StudentPerformanceDto s : data.getStudents()) {
            csv.append(s.getId()).append(",")
               .append(escapeCsv(s.getUsername())).append(",")
               .append(escapeCsv(s.getEmail())).append(",")
               .append(s.getStatus() != null ? s.getStatus() : "").append(",")
               .append(s.getAverageScore()).append(",")
               .append(s.getQuizAttempts()).append(",")
               .append(s.getTrend()).append("\n");
        }
        csv.append("\nSubject,% Study Time,Sessions\n");
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

    // ── Admin Dashboard Overview ─────────────────────────────────────────────

    public AdminDashboardDto getDashboardOverview() {
        List<User> allUsers = userRepository.findAll();
        long activeEngagement = allUsers.stream()
                .filter(u -> "Active".equals(u.getStatus())).count();

        List<StudySession> allSessions = studySessionRepository.findAll();

        long concurrentSessions = allSessions.stream()
                .filter(s -> s.getEndTime() == null).count();

        OptionalDouble avgOpt = allSessions.stream()
                .filter(s -> s.getStartTime() != null && s.getEndTime() != null)
                .mapToDouble(s -> Math.min(10.0, sessionMinutes(s) / 12.0))
                .average();
        double avgFocusScore = avgOpt.isPresent()
                ? Math.round(avgOpt.getAsDouble() * 10) / 10.0 : 0.0;

        // Rolling 7-day window: index 0 = 6 days ago, index 6 = today
        LocalDateTime weekStart = LocalDate.now().minusDays(6).atStartOfDay();
        List<Long> weeklyVelocity = new ArrayList<>(Collections.nCopies(7, 0L));
        allSessions.stream()
                .filter(s -> s.getStartTime() != null
                        && !s.getStartTime().isBefore(weekStart)
                        && s.getEndTime() != null)
                .forEach(s -> {
                    int dayIdx = (int) Math.min(
                            Duration.between(weekStart, s.getStartTime()).toDays(), 6);
                    weeklyVelocity.set(dayIdx, weeklyVelocity.get(dayIdx) + sessionMinutes(s));
                });

        List<Integer> peakStudyTimes = computePeakStudyTimes(allSessions);

        List<AlertSummaryDto> alerts = systemAlertRepository
                .findTop10ByOrderByAlertTimeDesc()
                .stream().map(this::toAlertDto).collect(Collectors.toList());

        // Real week-over-week engagement trend
        LocalDateTime lastWeekStart = LocalDate.now().minusDays(13).atStartOfDay();
        long thisWeekCount = allSessions.stream()
                .filter(s -> s.getStartTime() != null && !s.getStartTime().isBefore(weekStart)).count();
        long lastWeekCount = allSessions.stream()
                .filter(s -> s.getStartTime() != null
                        && !s.getStartTime().isBefore(lastWeekStart)
                        && s.getStartTime().isBefore(weekStart)).count();
        double engagementTrend = lastWeekCount == 0
                ? (thisWeekCount > 0 ? 100.0 : 0.0)
                : Math.round(((thisWeekCount - lastWeekCount) * 100.0 / lastWeekCount) * 10) / 10.0;

        return AdminDashboardDto.builder()
                .activeEngagement(activeEngagement)
                .engagementTrend(engagementTrend)
                .avgFocusScore(avgFocusScore)
                .concurrentSessions(concurrentSessions)
                .weeklyVelocity(weeklyVelocity)
                .peakStudyTimes(peakStudyTimes)
                .alerts(alerts)
                .build();
    }

    public void dismissAlert(Long id) {
        systemAlertRepository.deleteById(id);
    }

    // ── System Configuration ─────────────────────────────────────────────────

    public SystemConfigDto getSystemConfig() {
        return toConfigDto(getOrCreateConfig());
    }

    public SystemConfigDto deployConfig(ConfigDeployRequestDto dto) {
        SystemConfig cfg = getOrCreateConfig();
        cfg.setDeepWorkMultiplier(clamp(dto.deepWorkMultiplier(), 1.0, 4.0));
        cfg.setContextSwitchPenalty(clamp(dto.contextSwitchPenalty(), -2.0, 0.0));
        cfg.setIdleDecayRate((int) clamp(dto.idleDecayRate(), 0, 100));
        if (dto.leaderboardResetCycle() != null && !dto.leaderboardResetCycle().isBlank()) {
            cfg.setLeaderboardResetCycle(dto.leaderboardResetCycle());
            cfg.setNextSyncWindow(computeNextSyncWindow(dto.leaderboardResetCycle()));
        }
        cfg.setLastDeployedAt(LocalDateTime.now());
        cfg.setDeployedBy("Admin");
        return toConfigDto(systemConfigRepository.save(cfg));
    }

    public SystemConfigDto forceLeaderboardReset() {
        SystemConfig cfg = getOrCreateConfig();
        cfg.setNextSyncWindow(computeNextSyncWindow(cfg.getLeaderboardResetCycle()));
        cfg.setLastDeployedAt(LocalDateTime.now());
        return toConfigDto(systemConfigRepository.save(cfg));
    }

    // ── Application Governance ────────────────────────────────────────────────

    public List<AppRuleDto> getAppRules(String type) {
        List<AppGovernanceRule> rules = (type == null || type.isBlank())
                ? appGovernanceRuleRepository.findAllByOrderByCreatedAtDesc()
                : appGovernanceRuleRepository.findByType(type.toUpperCase());
        return rules.stream().map(this::toRuleDto).collect(Collectors.toList());
    }

    public AppRuleDto addAppRule(AddAppRuleRequestDto dto) {
        if (dto.appName() == null || dto.appName().isBlank())
            throw new IllegalArgumentException("App name cannot be blank.");
        String type = dto.type() != null ? dto.type().toUpperCase() : "WHITELIST";
        if (!type.equals("WHITELIST") && !type.equals("BLACKLIST"))
            throw new IllegalArgumentException("Type must be WHITELIST or BLACKLIST.");
        if (appGovernanceRuleRepository.existsByAppNameIgnoreCaseAndType(dto.appName().trim(), type))
            throw new IllegalArgumentException(
                    "\"" + dto.appName().trim() + "\" is already in the " + type + ".");
        AppGovernanceRule rule = AppGovernanceRule.builder()
                .appName(dto.appName().trim())
                .type(type)
                .createdAt(LocalDateTime.now())
                .build();
        return toRuleDto(appGovernanceRuleRepository.save(rule));
    }

    public void deleteAppRule(Long id) {
        if (!appGovernanceRuleRepository.existsById(id))
            throw new RuntimeException("Rule not found.");
        appGovernanceRuleRepository.deleteById(id);
    }

    public String exportAppRulesCsv() {
        List<AppGovernanceRule> rules = appGovernanceRuleRepository.findAllByOrderByCreatedAtDesc();
        StringBuilder csv = new StringBuilder("ID,App Name,Type,Created At\n");
        for (AppGovernanceRule r : rules) {
            csv.append(r.getId()).append(",")
               .append(escapeCsv(r.getAppName())).append(",")
               .append(r.getType()).append(",")
               .append(r.getCreatedAt() != null ? r.getCreatedAt().toString() : "")
               .append("\n");
        }
        return csv.toString();
    }

    // ── Moderator Status ─────────────────────────────────────────────────────

    public ModeratorStatusDto getModeratorStatus() {
        List<User> admins = userRepository.findAll().stream()
                .filter(u -> u.getRole() == UserRoles.ADMIN && "Active".equals(u.getStatus()))
                .collect(Collectors.toList());
        long count = admins.size();
        long extra = Math.max(0, count - 3);
        List<String> avatars = admins.stream().limit(3)
                .map(u -> "https://api.dicebear.com/7.x/avataaars/svg?seed=" + u.getUsername())
                .collect(Collectors.toList());

        long liveNodes = studySessionRepository.count();

        List<User> allUsers = userRepository.findAll();
        long activeUsers = allUsers.stream()
                .filter(u -> "Active".equals(u.getStatus())).count();
        double baseScore = allUsers.isEmpty() ? 100.0
                : (activeUsers * 100.0 / allUsers.size());
        double integrityScore = Math.min(baseScore + 20.0, 100.0);
        integrityScore = Math.round(integrityScore * 10) / 10.0;

        return ModeratorStatusDto.builder()
                .moderatorCount(count)
                .extraCount(extra)
                .avatars(avatars)
                .liveNodes(liveNodes)
                .integrityScore(integrityScore)
                .build();
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private List<Double> buildScoreHistory(List<QuizAttempt> attempts) {
        List<Double> history = attempts.stream()
                .filter(a -> a.getStartTime() != null && a.getScore() != null
                        && a.getTotalQuestions() != null && a.getTotalQuestions() > 0)
                .sorted(Comparator.comparing(QuizAttempt::getStartTime))
                .map(a -> Math.round((double) a.getScore() / a.getTotalQuestions() * 100 * 10) / 10.0)
                .collect(Collectors.toCollection(ArrayList::new));
        if (history.size() > 7) history = history.subList(history.size() - 7, history.size());
        while (history.size() < 7) history.add(0, 0.0);
        return history;
    }

    private String categorizeDistraction(String reason) {
        String lower = reason.toLowerCase();
        if (lower.contains("social") || lower.contains("video") || lower.contains("watch"))
            return "Social Media";
        if (lower.contains("phone") || lower.contains("notification") || lower.contains("message") || lower.contains("chat"))
            return "Notifications";
        if (lower.contains("break") || lower.contains("noise") || lower.contains("tired") || lower.contains("snack"))
            return "Physical Breaks";
        return "Other Distractions";
    }

    private SystemConfig getOrCreateConfig() {
        return systemConfigRepository.findFirstBy()
                .orElseGet(this::createDefaultConfig);
    }

    private SystemConfig createDefaultConfig() {
        return systemConfigRepository.save(SystemConfig.builder()
                .deepWorkMultiplier(2.4)
                .contextSwitchPenalty(-0.8)
                .idleDecayRate(25)
                .leaderboardResetCycle("BI_WEEKLY")
                .nextSyncWindow(computeNextSyncWindow("BI_WEEKLY"))
                .lastDeployedAt(LocalDateTime.now())
                .deployedBy("System")
                .build());
    }

    private LocalDateTime computeNextSyncWindow(String cycle) {
        LocalDateTime base = LocalDateTime.now()
                .withHour(4).withMinute(0).withSecond(0).withNano(0);
        return switch (cycle != null ? cycle : "BI_WEEKLY") {
            case "WEEKLY"  -> base.plusDays(7);
            case "MONTHLY" -> base.plusMonths(1);
            default        -> base.plusDays(14);
        };
    }

    private double clamp(double v, double lo, double hi) {
        return Math.max(lo, Math.min(hi, v));
    }

    private SystemConfigDto toConfigDto(SystemConfig cfg) {
        DateTimeFormatter display = DateTimeFormatter.ofPattern("MMM d, HH:mm");
        DateTimeFormatter full    = DateTimeFormatter.ofPattern("MMM d yyyy, HH:mm");
        return SystemConfigDto.builder()
                .id(cfg.getId())
                .deepWorkMultiplier(cfg.getDeepWorkMultiplier())
                .contextSwitchPenalty(cfg.getContextSwitchPenalty())
                .idleDecayRate(cfg.getIdleDecayRate())
                .leaderboardResetCycle(cfg.getLeaderboardResetCycle())
                .nextSyncWindow(cfg.getNextSyncWindow() != null
                        ? cfg.getNextSyncWindow().format(display) : "—")
                .lastDeployedAt(cfg.getLastDeployedAt() != null
                        ? cfg.getLastDeployedAt().format(full) : "—")
                .deployedBy(cfg.getDeployedBy())
                .build();
    }

    private AppRuleDto toRuleDto(AppGovernanceRule rule) {
        return AppRuleDto.builder()
                .id(rule.getId())
                .appName(rule.getAppName())
                .type(rule.getType())
                .createdAt(rule.getCreatedAt() != null
                        ? rule.getCreatedAt().format(DateTimeFormatter.ofPattern("MMM d")) : "—")
                .build();
    }

    private double computeAvgScore(List<QuizAttempt> attempts) {
        return attempts.stream()
                .filter(a -> a.getTotalQuestions() != null && a.getTotalQuestions() > 0 && a.getScore() != null)
                .mapToDouble(a -> (double) a.getScore() / a.getTotalQuestions() * 100)
                .average().orElse(0.0);
    }

    private String computeTrend(List<QuizAttempt> attempts) {
        List<QuizAttempt> sorted = attempts.stream()
                .filter(a -> a.getStartTime() != null && a.getScore() != null
                        && a.getTotalQuestions() != null && a.getTotalQuestions() > 0)
                .sorted(Comparator.comparing(QuizAttempt::getStartTime))
                .collect(Collectors.toList());
        if (sorted.size() < 2) return "STABLE";
        double lastScore = (double) sorted.get(sorted.size() - 1).getScore()
                / sorted.get(sorted.size() - 1).getTotalQuestions() * 100;
        double prevAvg = sorted.subList(0, sorted.size() - 1).stream()
                .mapToDouble(a -> (double) a.getScore() / a.getTotalQuestions() * 100)
                .average().orElse(0.0);
        if (lastScore > prevAvg + 10) return "UP";
        if (lastScore < prevAvg - 10) return "DOWN";
        return "STABLE";
    }

    private long sessionMinutes(StudySession s) {
        return Duration.between(s.getStartTime(), s.getEndTime()).toMinutes();
    }

    private List<Integer> computePeakStudyTimes(List<StudySession> sessions) {
        int[][] counts = new int[7][6];
        for (StudySession s : sessions) {
            if (s.getStartTime() == null) continue;
            int dayIdx  = s.getStartTime().getDayOfWeek().getValue() - 1;
            int slotIdx = Math.min(s.getStartTime().getHour() / 4, 5);
            counts[dayIdx][slotIdx]++;
        }
        int maxCount = 1;
        for (int[] row : counts) for (int c : row) if (c > maxCount) maxCount = c;
        List<Integer> result = new ArrayList<>();
        for (int d = 0; d < 7; d++)
            for (int t = 0; t < 6; t++)
                result.add((counts[d][t] * 4) / maxCount);
        return result;
    }

    private AlertSummaryDto toAlertDto(SystemAlert alert) {
        return AlertSummaryDto.builder()
                .id(alert.getId()).title(alert.getTitle())
                .description(alert.getDescription())
                .time(formatTimeAgo(alert.getAlertTime()))
                .alertType(alert.getAlertType())
                .iconType(alert.getIconType())
                .build();
    }

    private String formatTimeAgo(LocalDateTime time) {
        if (time == null) return "Unknown";
        Duration d = Duration.between(time, LocalDateTime.now());
        if (d.toMinutes() < 60) return d.toMinutes() + " min ago";
        if (d.toHours() < 24)   return d.toHours() + " hr ago";
        return d.toDays() + (d.toDays() == 1 ? " day ago" : " days ago");
    }

    private UserResponseDto toDto(User user) {
        return new UserResponseDto(user.getId(), user.getUsername(),
                user.getEmail(), user.getRole() != null ? user.getRole().name() : null,
                user.getStatus());
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n"))
            return "\"" + value.replace("\"", "\"\"") + "\"";
        return value;
    }
}
