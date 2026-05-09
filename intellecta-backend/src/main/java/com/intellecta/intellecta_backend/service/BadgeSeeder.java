package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.model.BadgeDefinition;
import com.intellecta.intellecta_backend.repository.BadgeDefinitionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Seeds one BadgeDefinition row per BadgeType enum value on first startup.
 * Skips any that already exist (idempotent).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class BadgeSeeder implements ApplicationRunner {

    private final BadgeDefinitionRepository repo;

    @Override
    public void run(ApplicationArguments args) {
        List<BadgeDefinition> defaults = List.of(
            build("STREAK_FIRE",    "Streak Fire",        "Maintain a study streak for 7 consecutive days",              "RARE",      20.0, "STREAK_DAYS",        7,   70.0),
            build("STAR_SCHOLAR",   "Star Scholar",       "Complete 10 study sessions with dedication",                  "EPIC",       8.0, "TOTAL_SESSIONS",     10,  null),
            build("LEAF_BALANCED",  "Leaf Balanced",      "Complete 5 sessions — a healthy work-rest balance",           "COMMON",    70.0, "TOTAL_SESSIONS",     5,   null),
            build("MARATHON",       "Marathon",           "Complete a single study session lasting 4+ hours",            "EPIC",       8.0, "SESSION_DURATION",   240, null),
            build("EARLY_BIRD",     "Early Bird",         "Start a study session before 8:00 AM",                        "RARE",      20.0, "EARLY_BIRD",         1,   null),
            build("NIGHT_OWL",      "Night Owl",          "Study after 10:00 PM — burning the midnight oil",             "COMMON",    70.0, "NIGHT_OWL",          1,   null),
            build("CONSISTENT_CAT", "Consistent Cat",     "Maintain a 7-day study streak without missing a day",         "RARE",      20.0, "STREAK_DAYS",        7,   null),
            build("DEEP_DIVER",     "Deep Diver",         "Complete a 2-hour deep-work session",                         "EPIC",       8.0, "DEEP_WORK_SESSION",  120, null),
            build("MATH_WIZARD",    "Math Wizard",        "Create 20 notes — building your knowledge base",              "COMMON",    70.0, "TOTAL_NOTES",        20,  null),
            build("GOAL_GETTER",    "Goal Getter",        "Complete your very first study session",                      "COMMON",    70.0, "TOTAL_SESSIONS",     1,   null)
        );

        for (BadgeDefinition def : defaults) {
            if (!repo.existsByBadgeKey(def.getBadgeKey())) {
                repo.save(def);
                log.info("Seeded badge: {}", def.getBadgeKey());
            }
        }
    }

    private BadgeDefinition build(String key, String name, String desc,
                                  String rarity, Double targetPct,
                                  String ruleType, int threshold,
                                  Double extraTargetPct) {
        return BadgeDefinition.builder()
                .badgeKey(key)
                .displayName(name)
                .description(desc)
                .rarity(rarity)
                .targetPercentage(targetPct)
                .ruleType(ruleType)
                .ruleThreshold(threshold)
                .systemDefined(true)
                .build();
    }
}
