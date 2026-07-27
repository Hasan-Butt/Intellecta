package com.intellecta.intellecta_backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.intellecta.intellecta_backend.dto.request.LoginRequest;
import com.intellecta.intellecta_backend.dto.request.GoogleLoginRequest;
import com.intellecta.intellecta_backend.dto.request.RegisterRequest;
import com.intellecta.intellecta_backend.dto.response.LoginResponse;
import com.intellecta.intellecta_backend.service.AuthService;
import com.intellecta.intellecta_backend.security.SecurityUtils;
import com.intellecta.intellecta_backend.security.UserPrincipal;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Value("${app.security.cookie-secure:false}")
    private boolean cookieSecure;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        try {
            LoginResponse loginResponse = authService.login(request);
            setTokenCookie(response, loginResponse.getToken());
            return ResponseEntity.ok(loginResponse);
        } catch (Exception e) {
            System.out.println("Login Error: " + e.getMessage());
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@Valid @RequestBody GoogleLoginRequest request, HttpServletResponse response) {
        try {
            LoginResponse loginResponse = authService.googleLogin(request);
            setTokenCookie(response, loginResponse.getToken());
            return ResponseEntity.ok(loginResponse);
        } catch (Exception e) {
            System.out.println("Google Login Error: " + e.getMessage());
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request, HttpServletResponse response) {
        try {
            LoginResponse loginResponse = authService.register(request);
            setTokenCookie(response, loginResponse.getToken());
            return ResponseEntity.ok(loginResponse);
        } catch (Exception e) {
            System.out.println("Register Error: " + e.getMessage());
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("token", "")
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(0) // Immediately clear cookie
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe() {
        try {
            UserPrincipal principal = SecurityUtils.getAuthenticatedUser();
            return ResponseEntity.ok(Map.of(
                "userId", principal.getId(),
                "email", principal.getUsername(),
                "role", principal.getRole()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Not authenticated");
        }
    }

    private void setTokenCookie(HttpServletResponse response, String token) {
        ResponseCookie cookie = ResponseCookie.from("token", token)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(24 * 60 * 60) // 24 hours
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
