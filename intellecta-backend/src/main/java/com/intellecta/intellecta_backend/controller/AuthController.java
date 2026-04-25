package com.intellecta.intellecta_backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.intellecta.intellecta_backend.dto.request.LoginRequest;
import com.intellecta.intellecta_backend.service.AuthService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {

    @Autowired
    private AuthService authService;

   @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
    try {
        String response = authService.login(request);
        return ResponseEntity.ok(response);
    } catch (Exception e) {
        // This will print the actual error (e.g., "Invalid password") to the console
        System.out.println("Login Error: " + e.getMessage());
        return ResponseEntity.status(401).body(e.getMessage());
    }
}
}
