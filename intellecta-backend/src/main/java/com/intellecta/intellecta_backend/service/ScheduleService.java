package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.dto.request.GeneratesSchedulerRequest;
import com.intellecta.intellecta_backend.dto.response.GeneratesSchedulerResponse;

public interface ScheduleService {
    GeneratesSchedulerResponse generate(Long userId, GeneratesSchedulerRequest request);
}