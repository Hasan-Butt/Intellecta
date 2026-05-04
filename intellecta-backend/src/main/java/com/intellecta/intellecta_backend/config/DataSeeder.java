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

        String[] subjects   = {"Mathematics", "Physics", "Computer Science"};
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
                .deployedBy("Prof. Admin")
                .build());
        System.out.println("[DataSeeder] Seeded system config.");
    }

    // ── App Governance Rules ──────────────────────────────────────────────────

    private void seedAppGovernanceRules() {
        if (appGovernanceRuleRepository.count() > 0) return;
        appGovernanceRuleRepository.saveAll(List.of(
            AppGovernanceRule.builder().appName("Visual Studio Code")
                    .type("WHITELIST").createdAt(LocalDateTime.now().minusDays(30)).build(),
            AppGovernanceRule.builder().appName("Notion Desktop")
                    .type("WHITELIST").createdAt(LocalDateTime.now().minusDays(25)).build(),
            AppGovernanceRule.builder().appName("Slack (Huddles)")
                    .type("WHITELIST").createdAt(LocalDateTime.now().minusDays(20)).build(),
            AppGovernanceRule.builder().appName("Steam Client")
                    .type("BLACKLIST").createdAt(LocalDateTime.now().minusDays(30)).build(),
            AppGovernanceRule.builder().appName("Instagram Web")
                    .type("BLACKLIST").createdAt(LocalDateTime.now().minusDays(25)).build(),
            AppGovernanceRule.builder().appName("Reddit (All Subdomains)")
                    .type("BLACKLIST").createdAt(LocalDateTime.now().minusDays(20)).build()
        ));
        System.out.println("[DataSeeder] Seeded app governance rules.");
    }

    // ── System alerts ─────────────────────────────────────────────────────────

    private void seedAlerts() {
        if (systemAlertRepository.count() > 0) return;
        systemAlertRepository.saveAll(List.of(
            alert("Anomalous Session Duration",
                  "User ID: 88219 logged 18+ consecutive focus hours.",
                  2, "CRITICAL", "ANOMALY"),
            alert("API Latency Spike",
                  "EU-West node experiencing >400ms response times.",
                  14, "WARNING", "PERFORMANCE"),
            alert("Account Safeguard Triggered",
                  "Multiple login attempts from unverified IP (Beijing, CN).",
                  60, "RESOLVED", "SECURITY"),
            alert("High Quiz Failure Rate",
                  "Chemistry quiz showing 78% failure rate — content review recommended.",
                  180, "WARNING", "PERFORMANCE"),
            alert("Bulk Registration Detected",
                  "42 new student accounts registered within a 10-minute window.",
                  300, "RESOLVED", "SECURITY")
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
        "Mathematics", "Physics", "Chemistry", "Computer Science", "English Literature"
    };

    private static final String[] DISTRACTIONS = {
        "Checked social media", "Received phone call", "Took unplanned break",
        "Started watching videos", "Got distracted by notifications",
        "Opened unrelated app", "Chat messages interrupted focus"
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
            {"Ali Hassan",       "ali.hassan@intellecta.com",       "Active"},
            {"Sara Khan",        "sara.khan@intellecta.com",        "Active"},
            {"Usman Malik",      "usman.malik@intellecta.com",      "Active"},
            {"Fatima Siddiqui",  "fatima.sid@intellecta.com",       "Active"},
            {"Ahmed Raza",       "ahmed.raza@intellecta.com",       "Active"},
            {"Zainab Qureshi",   "zainab.q@intellecta.com",         "Active"},
            {"Bilal Chaudhry",   "bilal.ch@intellecta.com",         "Inactive"},
            {"Nadia Ahmed",      "nadia.ahmed@intellecta.com",      "Active"},
            {"Omar Khan",        "omar.khan@intellecta.com",        "Active"},
            {"Ayesha Tariq",     "ayesha.tariq@intellecta.com",     "Active"},
            {"Hassan Ali",       "hassan.ali@intellecta.com",       "Active"},
            {"Maryam Noor",      "maryam.noor@intellecta.com",      "Active"},
            {"Imran Butt",       "imran.butt@intellecta.com",       "Active"},
            {"Sana Iqbal",       "sana.iqbal@intellecta.com",       "Active"},
            {"Talha Raza",       "talha.raza@intellecta.com",       "Inactive"},
            {"Rabia Malik",      "rabia.malik@intellecta.com",      "Active"},
            {"Faisal Ahmed",     "faisal.ahmed@intellecta.com",     "Active"},
            {"Hira Anwar",       "hira.anwar@intellecta.com",       "Active"},
            {"Zubair Hassan",    "zubair.hassan@intellecta.com",    "Active"},
            {"Amna Sheikh",      "amna.sheikh@intellecta.com",      "Inactive"},
        };

        for (String[] row : data) {
            if (!userRepository.existsByEmail(row[1])) {
                User u = new User();
                u.setUsername(row[0]); u.setEmail(row[1]);
                u.setPassword(passwordEncoder.encode("password123"));
                u.setRole(UserRoles.STUDENT); u.setStatus(row[2]);
                userRepository.save(u);
            }
        }

        String[][] admins = {
            {"Prof. Admin",  "prof.admin@intellecta.com"},
            {"Dr. Khan",     "dr.khan@intellecta.com"},
            {"Prof. Rahman", "prof.rahman@intellecta.com"},
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

        for (User student : students) {
            int profile = (int) (student.getId() % 3); // 0=heavy, 1=moderate, 2=light
            double studyChance = profile == 0 ? 0.65 : profile == 1 ? 0.45 : 0.25;

            for (int daysBack = 89; daysBack >= 1; daysBack--) {
                if (rng.nextDouble() > studyChance) continue;
                int numSessions = (profile == 0 && rng.nextDouble() > 0.55) ? 2 : 1;
                for (int s = 0; s < numSessions; s++) {
                    int startHour    = 7 + rng.nextInt(15);
                    int durationMins = 30 + rng.nextInt(91);
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
    //   0 = consistently high  (~87%)
    //   1 = improving          (38% → 86% over 7 months)
    //   2 = declining          (88% → 40% over 7 months)
    //   3 = consistently low   (~38-45%)   ← ensures weak topics appear
    //   4 = volatile           (random 30-90%)

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
                        case 0  -> baseScorePct = 87.0;
                        case 1  -> baseScorePct = 38.0 + (6 - monthsBack) * 8.0;  // 38→86
                        case 2  -> baseScorePct = 88.0 - (6 - monthsBack) * 8.0;  // 88→40
                        case 3  -> baseScorePct = 38.0 + rng.nextInt(10);           // 38-47 (low)
                        default -> baseScorePct = 30.0 + rng.nextInt(60);           // volatile
                    }
                    double variance = (rng.nextDouble() - 0.5) * 12.0;
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
        {BadgeType.STAR_SCHOLAR,  BadgeType.GOAL_GETTER},
        {BadgeType.STREAK_FIRE,   BadgeType.CONSISTENT_CAT},
        {BadgeType.DEEP_DIVER},
        {BadgeType.LEAF_BALANCED, BadgeType.MARATHON},
        {BadgeType.STAR_SCHOLAR,  BadgeType.MATH_WIZARD, BadgeType.GOAL_GETTER},
        {BadgeType.STREAK_FIRE},
        {BadgeType.EARLY_BIRD},
        {BadgeType.NIGHT_OWL,     BadgeType.DEEP_DIVER},
    };

    private void seedAchievements(List<User> students) {
        List<Achievement> batch = new ArrayList<>();
        for (int i = 0; i < students.size() && i < STUDENT_BADGES.length; i++) {
            User u = students.get(i);
            for (BadgeType badge : STUDENT_BADGES[i]) {
                batch.add(Achievement.builder()
                    .user(u).badgeName(badge)
                    .description(badge.name().replace('_', ' ').toLowerCase())
                    .build());
            }
        }
        achievementRepository.saveAll(batch);
    }
}
