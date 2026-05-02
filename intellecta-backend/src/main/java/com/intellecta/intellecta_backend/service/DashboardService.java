package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.dto.response.DashboardResponse;

public interface DashboardService {
    DashboardResponse getDashboard(Long userId);
}