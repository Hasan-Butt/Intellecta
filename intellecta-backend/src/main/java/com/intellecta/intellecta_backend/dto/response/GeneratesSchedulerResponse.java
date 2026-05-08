package com.intellecta.intellecta_backend.dto.response;

import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GeneratesSchedulerResponse {
    private boolean feasible;                      // false = insufficient hours warning
    private double totalRequiredHours;
    private double totalAvailableHours;            // availableHoursPerDay × 7
    private String warningMessage;                 // non-null when !feasible
    private List<String> suggestions;             // shown when !feasible
    private List<ScheduleBlockResponse> blocks;   // 7-day plan
}