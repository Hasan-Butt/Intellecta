package com.intellecta.intellecta_backend.controller;

import com.intellecta.intellecta_backend.dto.request.DistractionRequest;
import com.intellecta.intellecta_backend.model.DistractionEntry;
import com.intellecta.intellecta_backend.model.User;
import com.intellecta.intellecta_backend.repository.DistractionRepository;
import com.intellecta.intellecta_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/distractions")
@RequiredArgsConstructor
public class DistractionController {

    private final DistractionRepository distractionRepository;
    private final UserRepository        userRepository;

    @PostMapping("/user/{userId}")
    public ResponseEntity<DistractionEntry> log(
        @PathVariable Long userId,
        @RequestBody DistractionRequest request
    ) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        DistractionEntry entry = DistractionEntry.builder()
            .user(user)
            .reason(request.getReason())
            .build();

        return ResponseEntity.ok(distractionRepository.save(entry));
    }
}