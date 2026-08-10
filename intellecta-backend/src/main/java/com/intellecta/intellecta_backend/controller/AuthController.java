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
import com.intellecta.intellecta_backend.security.TokenBlacklistService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private TokenBlacklistService tokenBlacklistService;

    @Value("${app.security.cookie-secure:false}")
    private boolean cookieSecure;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        LoginResponse loginResponse = authService.login(request);
        setTokenCookie(response, loginResponse.getToken());
        return ResponseEntity.ok(loginResponse);
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@Valid @RequestBody GoogleLoginRequest request, HttpServletResponse response) {
        LoginResponse loginResponse = authService.googleLogin(request);
        setTokenCookie(response, loginResponse.getToken());
        return ResponseEntity.ok(loginResponse);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request, HttpServletResponse response) {
        LoginResponse loginResponse = authService.register(request);
        setTokenCookie(response, loginResponse.getToken());
        return ResponseEntity.ok(loginResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        String token = extractToken(request);
        tokenBlacklistService.blacklist(token);

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
        UserPrincipal principal = SecurityUtils.getAuthenticatedUser();
        return ResponseEntity.ok(Map.of(
            "userId", principal.getId(),
            "email", principal.getUsername(),
            "role", principal.getRole()
        ));
    }

    private String extractToken(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("token".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    private void setTokenCookie(HttpServletResponse response, String token) {
        ResponseCookie cookie = ResponseCookie.from("token", token)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(7 * 24 * 60 * 60) // 7 days
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
