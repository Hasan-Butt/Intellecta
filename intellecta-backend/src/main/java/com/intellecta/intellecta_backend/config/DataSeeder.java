package com.intellecta.intellecta_backend.config;

import com.intellecta.intellecta_backend.enums.BadgeType;
import com.intellecta.intellecta_backend.enums.UserRoles;
import com.intellecta.intellecta_backend.model.*;
import com.intellecta.intellecta_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final SystemAlertRepository       systemAlertRepository;
    private final UserRepository              userRepository;
    private final StudySessionRepository      studySessionRepository;
    private final QuizAttemptRepository       quizAttemptRepository;
    private final DistractionRepository       distractionRepository;
    private final AchievementRepository       achievementRepository;
    private final QuizRepository              quizRepository;
    private final PasswordEncoder             passwordEncoder;
    private final SystemConfigRepository      systemConfigRepository;
    private final AppGovernanceRuleRepository appGovernanceRuleRepository;

    @Override
    public void run(String... args) {
        seedAlerts();
        seedRichTestData();
        seedActiveSessions();
        seedSystemConfig();
        seedAppGovernanceRules();
    }

    // ── Active (in-progress) sessions ────────────────────────────────────────

    private void seedActiveSessions() {
        boolean hasActive = studySessionRepository.findAll().stream()
                .anyMatch(s -> s.getEndTime() == null);
        if (hasActive) return;

        List<User> pool = new ArrayList<>();
        for (User u : userRepository.findAll()) {
            if (u.getRole() == UserRoles.STUDENT && "Active".equals(u.getStatus())) {
                pool.add(u);
                if (pool.size() == 3) break;
            }
        }
        if (pool.isEmpty()) return;

        String[] subjects   = {"Data Structures", "OOP", "Database Systems"};
        long[]   minutesAgo = {90L, 45L, 120L};
        for (int i = 0; i < pool.size(); i++) {
            studySessionRepository.save(StudySession.builder()
                    .user(pool.get(i))
                    .subject(subjects[i])
                    .startTime(LocalDateTime.now().minusMinutes(minutesAgo[i]))
                    .pomodorosCompleted((int) (minutesAgo[i] / 25))
                    .deepWork(minutesAgo[i] >= 60)
                    .build());
        }
        System.out.println("[DataSeeder] Seeded " + pool.size() + " active sessions.");
    }

    // ── System Config ─────────────────────────────────────────────────────────

    private void seedSystemConfig() {
        if (systemConfigRepository.count() > 0) return;
        systemConfigRepository.save(SystemConfig.builder()
                .deepWorkMultiplier(2.4)
                .contextSwitchPenalty(-0.8)
                .idleDecayRate(25)
                .leaderboardResetCycle("BI_WEEKLY")
                .nextSyncWindow(LocalDateTime.now().plusDays(14)
                        .withHour(4).withMinute(0).withSecond(0).withNano(0))
                .lastDeployedAt(LocalDateTime.now().minusDays(3))
                .deployedBy("Dr. Ayesha Khan")
                .build());
        System.out.println("[DataSeeder] Seeded system config.");
    }

    // ── App Governance Rules ──────────────────────────────────────────────────

    private void seedAppGovernanceRules() {
        if (appGovernanceRuleRepository.count() > 0) return;
        appGovernanceRuleRepository.saveAll(List.of(
            AppGovernanceRule.builder().appName("VS Code")
                    .type("WHITELIST").createdAt(LocalDateTime.now().minusDays(30)).build(),
            AppGovernanceRule.builder().appName("Notion")
                    .type("WHITELIST").createdAt(LocalDateTime.now().minusDays(25)).build(),
            AppGovernanceRule.builder().appName("Obsidian")
                    .type("WHITELIST").createdAt(LocalDateTime.now().minusDays(20)).build(),
            AppGovernanceRule.builder().appName("Figma")
                    .type("WHITELIST").createdAt(LocalDateTime.now().minusDays(18)).build(),
            AppGovernanceRule.builder().appName("Google Docs")
                    .type("WHITELIST").createdAt(LocalDateTime.now().minusDays(15)).build(),
            AppGovernanceRule.builder().appName("Slack")
                    .type("WHITELIST").createdAt(LocalDateTime.now().minusDays(12)).build(),
            AppGovernanceRule.builder().appName("Zoom")
                    .type("WHITELIST").createdAt(LocalDateTime.now().minusDays(10)).build(),
            AppGovernanceRule.builder().appName("Postman")
                    .type("WHITELIST").createdAt(LocalDateTime.now().minusDays(5)).build(),
            AppGovernanceRule.builder().appName("PUBG Mobile")
                    .type("BLACKLIST").createdAt(LocalDateTime.now().minusDays(30)).build(),
            AppGovernanceRule.builder().appName("Instagram")
                    .type("BLACKLIST").createdAt(LocalDateTime.now().minusDays(25)).build(),
            AppGovernanceRule.builder().appName("TikTok")
                    .type("BLACKLIST").createdAt(LocalDateTime.now().minusDays(20)).build(),
            AppGovernanceRule.builder().appName("Netflix")
                    .type("BLACKLIST").createdAt(LocalDateTime.now().minusDays(15)).build(),
            AppGovernanceRule.builder().appName("Steam")
                    .type("BLACKLIST").createdAt(LocalDateTime.now().minusDays(10)).build(),
            AppGovernanceRule.builder().appName("Spotify (non-study)")
                    .type("BLACKLIST").createdAt(LocalDateTime.now().minusDays(8)).build(),
            AppGovernanceRule.builder().appName("Reddit")
                    .type("BLACKLIST").createdAt(LocalDateTime.now().minusDays(6)).build(),
            AppGovernanceRule.builder().appName("Snapchat")
                    .type("BLACKLIST").createdAt(LocalDateTime.now().minusDays(4)).build(),
            AppGovernanceRule.builder().appName("Discord (gaming servers)")
                    .type("BLACKLIST").createdAt(LocalDateTime.now().minusDays(2)).build()
        ));
        System.out.println("[DataSeeder] Seeded app governance rules.");
    }

    // ── System alerts ─────────────────────────────────────────────────────────

    private void seedAlerts() {
        if (systemAlertRepository.count() > 0) return;
        systemAlertRepository.saveAll(List.of(
            alert("Unusual login pattern detected for user sara.khan",
                  "Unusual login pattern detected for user sara.khan.",
                  2, "CRITICAL", "ANOMALY"),
            alert("Peak concurrent sessions hit 47 — 18% above weekly average",
                  "Peak concurrent sessions hit 47 — 18% above weekly average.",
                  14, "WARNING", "PERFORMANCE"),
            alert("Quiz failure rate for Data Structures exceeded 70% threshold",
                  "Quiz failure rate for Data Structures exceeded 70% threshold.",
                  60, "RESOLVED", "PERFORMANCE"),
            alert("3 students flagged for 12+ consecutive study hours",
                  "3 students flagged for 12+ consecutive study hours.",
                  180, "WARNING", "ANOMALY"),
            alert("Storage utilization crossed 80% on document upload server",
                  "Storage utilization crossed 80% on document upload server.",
                  300, "RESOLVED", "SYSTEM")
        ));
    }

    private SystemAlert alert(String title, String desc, int minutesAgo, String type, String icon) {
        return SystemAlert.builder()
            .title(title).description(desc)
            .alertTime(LocalDateTime.now().minusMinutes(minutesAgo))
            .alertType(type).iconType(icon).build();
    }

    // ── Rich test data ────────────────────────────────────────────────────────

    private static final String[] SUBJECTS = {
        "Data Structures", "OOP", "Database Systems", "Calculus", "Linear Algebra", 
        "Software Engineering", "Operating Systems", "Computer Networks", 
        "Discrete Mathematics", "English Communication"
    };

    private static final String[] DISTRACTIONS = {
        "Got distracted by Instagram Reels",
        "Friend called from back home",
        "Opened YouTube for one video, stayed 40 minutes",
        "Went to get chai, ended up talking to roommates",
        "Started scrolling Twitter/X",
        "Phone notification from WhatsApp group",
        "Got hungry and took a long break",
        "Switched to playing PUBG Mobile"
    };

    private void seedRichTestData() {
        // Always ensure students exist
        List<User> students = seedStudents();
        if (students.isEmpty()) return;

        // Seed sessions only if sparse (first-time or fresh DB)
        if (studySessionRepository.count() < 200) {
            seedStudySessions(students);
            if (distractionRepository.count() == 0) seedDistractions(students);
            if (achievementRepository.count() == 0) seedAchievements(students);
            System.out.println("[DataSeeder] Seeded sessions + activities for " + students.size() + " students.");
        }

        // Seed quiz attempts independently — re-seed if no historical data (> 2 months old)
        // This fires on fresh DBs, old DBs with only recent data, and after table clears
        LocalDateTime twoMonthsAgo = LocalDateTime.now().minusMonths(2);
        if (quizAttemptRepository.countOlderThan(twoMonthsAgo) < 10) {
            seedQuizAttempts(students);
        }
    }

    // ── Students ──────────────────────────────────────────────────────────────

    private List<User> seedStudents() {
        String[][] data = {
            {"Muhammad Hamza",   "muhammad.hamza@intellecta.com",   "Active"},
            {"Ayesha Noor",      "ayesha.noor@intellecta.com",      "Active"},
            {"Zainab Ali",       "zainab.ali@intellecta.com",       "Active"},
            {"Rana Waqas",       "rana.waqas@intellecta.com",       "Active"},
            {"Bilal Tariq",      "bilal.tariq@intellecta.com",      "Active"},
            {"Fatima Zahra",     "fatima.zahra@intellecta.com",     "Active"},
            {"Usman Shah",       "usman.shah@intellecta.com",       "Inactive"},
            {"Nida Jamil",       "nida.jamil@intellecta.com",       "Active"},
            {"Ali Reza",         "ali.reza@intellecta.com",         "Active"},
            {"Hira Qureshi",     "hira.qureshi@intellecta.com",     "Active"},
            {"Saad Riaz",        "saad.riaz@intellecta.com",        "Active"},
            {"Mahnoor Safdar",   "mahnoor.safdar@intellecta.com",   "Active"},
            {"Talha Mehmood",    "talha.mehmood@intellecta.com",    "Active"},
            {"Sana Mir",         "sana.mir@intellecta.com",         "Active"},
            {"Fahad Mustafa",    "fahad.mustafa@intellecta.com",    "Inactive"},
            {"Iqra Aziz",        "iqra.aziz@intellecta.com",        "Active"},
            {"Omar Abdullah",    "omar.abdullah@intellecta.com",    "Active"},
            {"Amna Chaudhry",    "amna.chaudhry@intellecta.com",    "Active"},
            {"Hamza Kiani",      "hamza.kiani@intellecta.com",      "Active"},
            {"Kiran Sheikh",     "kiran.sheikh@intellecta.com",     "Inactive"},
        };

        for (String[] row : data) {
            if (!userRepository.existsByEmail(row[1])) {
                User u = new User();
                u.setUsername(row[0]); u.setEmail(row[1]);
                u.setPassword(passwordEncoder.encode("password123"));
                u.setRole(UserRoles.STUDENT); u.setStatus(row[2]);
                
                // Add some initial streak data
                u.setStreakDays(new Random().nextInt(12) + 1);
                u.setLastStudyDate(LocalDate.now().minusDays(new Random().nextInt(2))); // Today or yesterday
                
                userRepository.save(u);
            }
        }

        String[][] admins = {
            {"Dr. Ayesha Khan",      "dr.ayesha@intellecta.com"},
            {"Prof. Tariq Mahmood",  "tariq.mahmood@intellecta.com"},
            {"Mr. Bilal Chaudhry",   "bilal.chaudhry@intellecta.com"},
        };
        for (String[] a : admins) {
            if (!userRepository.existsByEmail(a[1])) {
                User admin = new User();
                admin.setUsername(a[0]); admin.setEmail(a[1]);
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole(UserRoles.ADMIN); admin.setStatus("Active");
                userRepository.save(admin);
            }
        }

        // Return all students currently in DB
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == UserRoles.STUDENT)
                .collect(Collectors.toList());
    }

    // ── Study sessions — 90-day programmatic generation ───────────────────────

    private void seedStudySessions(List<User> students) {
        Random rng = new Random(42L);
        List<StudySession> batch = new ArrayList<>();
        int[] durations = {45, 90, 120};
        int[] morningHours = {8, 9, 10, 11};
        int[] afternoonHours = {14, 15, 16, 17};
        int[] nightHours = {21, 22, 23, 0};

        for (User student : students) {
            int profile = (int) (student.getId() % 3); // 0=heavy, 1=moderate, 2=light
            double studyChance = profile == 0 ? 0.80 : profile == 1 ? 0.55 : 0.35;
            
            // Assign a preferred study time pattern
            int timePattern = rng.nextInt(3);

            for (int daysBack = 89; daysBack >= 1; daysBack--) {
                if (rng.nextDouble() > studyChance) continue;
                int numSessions = (profile == 0 && rng.nextDouble() > 0.55) ? 2 : 1;
                for (int s = 0; s < numSessions; s++) {
                    int startHour;
                    if (timePattern == 0) {
                        startHour = morningHours[rng.nextInt(morningHours.length)];
                    } else if (timePattern == 1) {
                        startHour = afternoonHours[rng.nextInt(afternoonHours.length)];
                    } else {
                        startHour = nightHours[rng.nextInt(nightHours.length)];
                    }
                    
                    int durationMins = durations[rng.nextInt(durations.length)];
                    String subject   = SUBJECTS[rng.nextInt(SUBJECTS.length)];
                    LocalDateTime start = LocalDateTime.now()
                            .minusDays(daysBack)
                            .withHour(startHour)
                            .withMinute(rng.nextInt(60))
                            .withSecond(0).withNano(0);
                    batch.add(StudySession.builder()
                            .user(student).subject(subject)
                            .startTime(start).endTime(start.plusMinutes(durationMins))
                            .pomodorosCompleted(durationMins / 25).deepWork(durationMins >= 60)
                            .build());
                }
            }
        }
        studySessionRepository.saveAll(batch);
        System.out.println("[DataSeeder] Seeded " + batch.size() + " study sessions (90 days).");
    }

    // ── Quiz attempts — 7-month programmatic generation ──────────────────────
    //
    // Score profiles by (student.id % 5):
    //   0 = consistently high  (~85%)
    //   1 = improving          (38% → 86% over 7 months)
    //   2 = declining          (88% → 40% over 7 months)
    //   3 = consistently low   (~45%)   ← ensures weak topics appear
    //   4 = average            (~65%)

    private void seedQuizAttempts(List<User> students) {
        List<Quiz> quizzes = quizRepository.findAllWithQuestions();
        if (quizzes.isEmpty()) {
            System.out.println("[DataSeeder] No quizzes found — skipping quiz attempts.");
            return;
        }

        Random rng = new Random(12345L);
        List<QuizAttempt> batch = new ArrayList<>();

        for (User student : students) {
            int profile = (int) (student.getId() % 5);

            for (int monthsBack = 6; monthsBack >= 0; monthsBack--) {
                int attemptsThisMonth = 1 + rng.nextInt(3);

                for (int a = 0; a < attemptsThisMonth; a++) {
                    Quiz quiz  = quizzes.get(rng.nextInt(quizzes.size()));
                    int totalQ = (quiz.getQuestions() != null && !quiz.getQuestions().isEmpty())
                            ? quiz.getQuestions().size() : 3;

                    double baseScorePct;
                    switch (profile) {
                        case 0  -> baseScorePct = 85.0;
                        case 1  -> baseScorePct = 38.0 + (6 - monthsBack) * 8.0;  // 38→86
                        case 2  -> baseScorePct = 88.0 - (6 - monthsBack) * 8.0;  // 88→40
                        case 3  -> baseScorePct = 45.0;                           // 45
                        default -> baseScorePct = 65.0;                           // average
                    }
                    double variance = (rng.nextDouble() - 0.5) * 20.0;
                    double finalPct = Math.max(0, Math.min(100, baseScorePct + variance));
                    int score = (int) Math.round(finalPct / 100.0 * totalQ);

                    YearMonth ym   = YearMonth.now().minusMonths(monthsBack);
                    int dayOfMonth = 1 + rng.nextInt(ym.lengthOfMonth() - 1);
                    LocalDateTime start = LocalDate.of(ym.getYear(), ym.getMonth(), dayOfMonth)
                            .atTime(10 + rng.nextInt(8), rng.nextInt(60));

                    batch.add(QuizAttempt.builder()
                            .user(student).quiz(quiz)
                            .score(score).totalQuestions(totalQ)
                            .startTime(start).endTime(start.plusMinutes(15 + rng.nextInt(25)))
                            .status("COMPLETED").userAnswers(new HashMap<>())
                            .build());
                }
            }
        }
        quizAttemptRepository.saveAll(batch);
        System.out.println("[DataSeeder] Seeded " + batch.size() + " quiz attempts (7 months).");
    }

    // ── Distractions ──────────────────────────────────────────────────────────

    private void seedDistractions(List<User> students) {
        List<DistractionEntry> batch = new ArrayList<>();
        for (int i = 0; i < students.size(); i++) {
            User u    = students.get(i);
            int count = 8 + (i % 5);
            for (int j = 0; j < count; j++) {
                batch.add(DistractionEntry.builder()
                    .user(u).reason(DISTRACTIONS[(i + j) % DISTRACTIONS.length])
                    .build());
            }
        }
        distractionRepository.saveAll(batch);
    }

    // ── Achievements ──────────────────────────────────────────────────────────

    private static final BadgeType[][] STUDENT_BADGES = {
        {BadgeType.MARATHON,      BadgeType.DEEP_DIVER, BadgeType.STREAK_FIRE}, // heavy
        {BadgeType.EARLY_BIRD},                                                 // morning
        {BadgeType.NIGHT_OWL},                                                  // night
        {BadgeType.CONSISTENT_CAT,BadgeType.GOAL_GETTER},                       // consistent
        {BadgeType.STAR_SCHOLAR,  BadgeType.MATH_WIZARD},                       // top
        {BadgeType.STREAK_FIRE},
        {BadgeType.EARLY_BIRD,    BadgeType.CONSISTENT_CAT},
        {BadgeType.NIGHT_OWL,     BadgeType.DEEP_DIVER},
        {BadgeType.MARATHON,      BadgeType.STAR_SCHOLAR},
        {BadgeType.GOAL_GETTER}
    };

    private void seedAchievements(List<User> students) {
        List<Achievement> batch = new ArrayList<>();
        for (int i = 0; i < students.size(); i++) {
            User u = students.get(i);
            BadgeType[] badges = STUDENT_BADGES[i % STUDENT_BADGES.length];
            for (BadgeType badge : badges) {
                batch.add(Achievement.builder()
                    .user(u).badgeName(badge.name())
                    .description(badge.name().replace('_', ' ').toLowerCase())
                    .build());
            }
        }
        achievementRepository.saveAll(batch);
    }
}
