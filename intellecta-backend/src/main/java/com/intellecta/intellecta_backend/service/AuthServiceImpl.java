package com.intellecta.intellecta_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.intellecta.intellecta_backend.dto.request.LoginRequest;
import com.intellecta.intellecta_backend.dto.response.LoginResponse;
import com.intellecta.intellecta_backend.model.User;
import com.intellecta.intellecta_backend.repository.UserRepository;
import com.intellecta.intellecta_backend.util.JwtUtil;

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
            throw new RuntimeException("User not found");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole().name());

        return new LoginResponse(token, user.getId(), user.getEmail(), user.getRole());
    }
}
