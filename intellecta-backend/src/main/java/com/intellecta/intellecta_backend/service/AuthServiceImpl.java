package com.intellecta.intellecta_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.intellecta.intellecta_backend.dto.request.GoogleLoginRequest;
import com.intellecta.intellecta_backend.dto.request.LoginRequest;
import com.intellecta.intellecta_backend.dto.request.RegisterRequest;
import com.intellecta.intellecta_backend.dto.response.LoginResponse;
import com.intellecta.intellecta_backend.model.User;
import com.intellecta.intellecta_backend.enums.UserRoles;
import com.intellecta.intellecta_backend.repository.UserRepository;
import com.intellecta.intellecta_backend.util.JwtUtil;

import java.util.Map;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail());

        if (user == null) {
            throw new RuntimeException("No account found with this email.");
        }

        // Handle Google users who haven't set a password
        if (user.getPassword() == null) {
            throw new RuntimeException("This account is linked with Google. Please use 'Login with Google'.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password.");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole().name());

        return new LoginResponse(token, user.getId(), user.getEmail(), user.getRole());
    }

    @Override
    @SuppressWarnings("unchecked")
    public LoginResponse googleLogin(GoogleLoginRequest request) {
        try {
            // Use Spring's RestTemplate to call Google's userinfo endpoint
            RestTemplate restTemplate = new RestTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + request.getIdToken());
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                HttpMethod.GET,
                entity,
                Map.class
            );

            Map<String, Object> userInfo = response.getBody();

            if (userInfo == null) {
                throw new RuntimeException("Empty response from Google.");
            }

            String email = (String) userInfo.get("email");
            String name  = (String) userInfo.get("name");

            if (email == null) {
                throw new RuntimeException("Could not retrieve email from Google.");
            }

            System.out.println("Google Login: email=" + email + ", name=" + name);

            User user = userRepository.findByEmail(email);

            if (user == null) {
                // First-time Google login — auto-create the account
                user = new User();
                user.setEmail(email);
                user.setUsername(name != null ? name : email.split("@")[0]);
                user.setRole(UserRoles.STUDENT);
                user = userRepository.save(user);
                System.out.println("Google Login: new user created with id=" + user.getId());
            } else {
                System.out.println("Google Login: existing user found with id=" + user.getId());
            }

            String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole().name());

            return new LoginResponse(token, user.getId(), user.getEmail(), user.getRole());

        } catch (Exception e) {
            System.out.println("Google Login Exception: " + e.getClass().getName() + " - " + e.getMessage());
            throw new RuntimeException("Google authentication failed: " + e.getMessage(), e);
        }
    }

    @Override
    public LoginResponse register(RegisterRequest request) {
        // Validate passwords match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match.");
        }

        // Validate email not already taken
        if (userRepository.findByEmail(request.getEmail()) != null) {
            throw new RuntimeException("An account with this email already exists.");
        }

        // Create new student user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(UserRoles.STUDENT);
        user = userRepository.save(user);

        System.out.println("Register: new student created - " + user.getEmail());

        String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole().name());
        return new LoginResponse(token, user.getId(), user.getEmail(), user.getRole());
    }
}
