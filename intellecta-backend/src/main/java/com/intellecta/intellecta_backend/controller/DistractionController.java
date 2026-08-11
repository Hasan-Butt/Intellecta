package com.intellecta.intellecta_backend.controller;

import com.intellecta.intellecta_backend.dto.request.DistractionRequest;
import com.intellecta.intellecta_backend.model.DistractionEntry;
import com.intellecta.intellecta_backend.model.User;
import com.intellecta.intellecta_backend.repository.DistractionRepository;
import com.intellecta.intellecta_backend.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.intellecta.intellecta_backend.security.SecurityUtils;
import java.util.List;

@RestController
@RequestMapping("/api/distractions")
@RequiredArgsConstructor
public class DistractionController {

    private final DistractionRepository distractionRepository;
    private final UserRepository        userRepository;

    @PostMapping("/user/{userId}")
    public ResponseEntity<DistractionEntry> log(
        @PathVariable Long userId,
        @Valid @RequestBody DistractionRequest request
    ) {
        SecurityUtils.validateUser(userId);
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        String calculatedImpact = "MODERATE";
        if (request.getDuration() != null) {
            String numericString = request.getDuration().replaceAll("[^0-9]", "");
            if (!numericString.isEmpty()) {
                try {
                    int mins = Integer.parseInt(numericString);
                    if (mins <= 1) {
                        calculatedImpact = "LOW";
                    } else if (mins <= 3) {
                        calculatedImpact = "MODERATE";
                    } else {
                        calculatedImpact = "HIGH";
                    }
                } catch (NumberFormatException ignored) {
                }
            }
        }

        DistractionEntry entry = DistractionEntry.builder()
            .user(user)
            .reason(request.getReason())
            .duration(request.getDuration())
            .impact(calculatedImpact)
            .build();

        return ResponseEntity.ok(distractionRepository.save(entry));
    }

    @GetMapping("/user/{userId}/logs")
    public ResponseEntity<List<com.intellecta.intellecta_backend.dto.response.DistractionLogDTO>> getLogs(@PathVariable Long userId) {
        SecurityUtils.validateUser(userId);
        List<DistractionEntry> entries = distractionRepository.findByUserIdOrderByLoggedAtDesc(userId);
        
        List<com.intellecta.intellecta_backend.dto.response.DistractionLogDTO> dtos = entries.stream()
            .map(e -> com.intellecta.intellecta_backend.dto.response.DistractionLogDTO.builder()
                .id(e.getId())
                .reason(e.getReason())
                .duration(e.getDuration())
                .impact(e.getImpact())
                .loggedAt(e.getLoggedAt())
                .build())
            .toList();
            
        return ResponseEntity.ok(dtos);
    }
}