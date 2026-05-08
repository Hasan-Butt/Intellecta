package com.intellecta.intellecta_backend.service;

import java.time.LocalDate;
import java.time.format.TextStyle;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.intellecta.intellecta_backend.dto.request.GeneratesSchedulerRequest;
import com.intellecta.intellecta_backend.dto.response.GeneratesSchedulerResponse;
import com.intellecta.intellecta_backend.dto.response.ScheduleBlockResponse;
import com.intellecta.intellecta_backend.enums.CourseDifficulty;
import com.intellecta.intellecta_backend.model.Course;
import com.intellecta.intellecta_backend.repository.CourseRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ScheduleServiceImpl implements ScheduleService {

    private final CourseRepository courseRepository;

    @Override
    public GeneratesSchedulerResponse generate(Long userId, GeneratesSchedulerRequest req) {
        double availablePerDay = Math.max(1.0, Math.min(16.0, req.getAvailableHoursPerDay()));

        List<Course> courses = courseRepository.findByUserIdOrderByExamDateAsc(userId);
        if (courses.isEmpty()) {
            return GeneratesSchedulerResponse.builder()
                .feasible(true)
                .totalRequiredHours(0)
                .totalAvailableHours(availablePerDay * 7)
                .blocks(Collections.emptyList())
                .build();
        }

        // ── 1. Compute weight per course ────────────────────────────────────
        // Weight = difficultyMultiplier / daysUntilExam  (urgency × hardness)
        LocalDate today = LocalDate.now();
        Map<Course, Double> weights = new LinkedHashMap<>();
        double totalWeight = 0;

        for (Course c : courses) {
            long days = c.getExamDate() != null
                ? Math.max(1, ChronoUnit.DAYS.between(today, c.getExamDate()))
                : 30;
            double diff = difficultyMultiplier(c.getDifficulty());
            double w = diff / (double) days;
            weights.put(c, w);
            totalWeight += w;
        }

        // ── 2. Allocate hours per day per course ────────────────────────────
        // Each course gets a fraction of availablePerDay proportional to its weight
        final double tw = totalWeight;
        Map<Course, Double> dailyAllocation = new LinkedHashMap<>();
        double totalRequired = 0;

        for (Course c : courses) {
            double fraction = weights.get(c) / tw;
            double hours = availablePerDay * fraction;
            dailyAllocation.put(c, hours);
            // Total required = sum of plannedHoursPerDay × days until exam for each course
            long daysLeft = c.getExamDate() != null
                ? Math.max(1, ChronoUnit.DAYS.between(today, c.getExamDate()))
                : 30;
            totalRequired += c.getPlannedHoursPerDay() * Math.min(daysLeft, 7);
        }

        double totalAvailable = availablePerDay * 7;

        // ── 3. Feasibility check ────────────────────────────────────────────
        boolean feasible = totalAvailable >= totalRequired;
        String warning = null;
        List<String> suggestions = null;

        if (!feasible) {
            warning = String.format(
                "Warning: You have %.0f hours of material but only %.0f hours available over 7 days.",
                totalRequired, totalAvailable);
            suggestions = new ArrayList<>();
            suggestions.add("Prioritize courses with nearest exam dates first.");
            suggestions.add("Increase daily study hours to at least " +
                String.format("%.1f", totalRequired / 7.0) + "h/day.");
            suggestions.add("Consider reducing planned coverage for lower-priority courses.");
        }

        // ── 4. Build 7-day block list ───────────────────────────────────────
        List<ScheduleBlockResponse> blocks = new ArrayList<>();

        for (int i = 0; i < 7; i++) {
            LocalDate date = today.plusDays(i);
            String dayLabel = date.getDayOfWeek()
                .getDisplayName(TextStyle.SHORT, Locale.ENGLISH);

            for (Course c : courses) {
                long daysLeft = c.getExamDate() != null
                    ? Math.max(0, ChronoUnit.DAYS.between(today, c.getExamDate()))
                    : 30;

                // Skip if exam already passed
                if (daysLeft == 0 && i > 0) continue;

                double hoursToday = dailyAllocation.getOrDefault(c, 0.0);

                // Boost hours on days closer to the exam
                if (daysLeft <= 3) hoursToday = Math.min(availablePerDay, hoursToday * 1.5);

                blocks.add(ScheduleBlockResponse.builder()
                    .courseName(c.getCourseName())
                    .date(date)
                    .dayLabel(dayLabel)
                    .hoursAllocated(Math.round(hoursToday * 10.0) / 10.0)
                    .priority(resolvePriority(c.getDifficulty(), daysLeft))
                    .daysUntilExam(daysLeft)
                    .build());
            }
        }

        return GeneratesSchedulerResponse.builder()
            .feasible(feasible)
            .totalRequiredHours(Math.round(totalRequired * 10.0) / 10.0)
            .totalAvailableHours(Math.round(totalAvailable * 10.0) / 10.0)
            .warningMessage(warning)
            .suggestions(suggestions)
            .blocks(blocks)
            .build();
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private double difficultyMultiplier(CourseDifficulty d) {
        if (d == null) return 2.0;
        return switch (d) {
            case EASY   -> 1.0;
            case MEDIUM -> 2.0;
            case HARD   -> 3.5;
        };
    }

    private String resolvePriority(CourseDifficulty difficulty, long daysUntilExam) {
        if (daysUntilExam <= 7 || difficulty == CourseDifficulty.HARD)  return "HIGH";
        if (daysUntilExam <= 21 || difficulty == CourseDifficulty.MEDIUM) return "MEDIUM";
        return "LOW";
    }
}