package com.intellecta.intellecta_backend.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.Data;

@Data
public class GeneratesSchedulerRequest {
    @DecimalMin("0") @DecimalMax("24")
    private double availableHoursPerDay;
}