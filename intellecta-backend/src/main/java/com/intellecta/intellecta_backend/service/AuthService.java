package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.dto.request.LoginRequest;
import com.intellecta.intellecta_backend.dto.response.LoginResponse;

import com.intellecta.intellecta_backend.dto.request.GoogleLoginRequest;

public interface AuthService {
    LoginResponse login(LoginRequest request);
    LoginResponse googleLogin(GoogleLoginRequest request);
}
