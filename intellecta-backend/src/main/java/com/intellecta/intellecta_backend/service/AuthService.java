package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.dto.request.LoginRequest;
import com.intellecta.intellecta_backend.dto.response.LoginResponse;

public interface AuthService {
    LoginResponse login(LoginRequest request);
}
