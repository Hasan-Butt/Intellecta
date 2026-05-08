package com.intellecta.intellecta_backend.dto.request;

import lombok.Data;

@Data
public class GeneratesSchedulerRequest {
    private double availableHoursPerDay; // student's daily availability
}