package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.dto.request.LoginRequest;

public interface AuthService {
    String login(LoginRequest request);
}
