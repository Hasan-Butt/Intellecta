package com.intellecta.intellecta_backend.controller;

import com.intellecta.intellecta_backend.dto.request.DistractionRequest;
import com.intellecta.intellecta_backend.model.DistractionEntry;
import com.intellecta.intellecta_backend.model.User;
import com.intellecta.intellecta_backend.repository.DistractionRepository;
import com.intellecta.intellecta_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.intellecta.intellecta_backend.dto.response.TriggerStatDTO;
import java.util.ArrayList;
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

    @GetMapping("/user/{userId}/triggers")
    public ResponseEntity<List<TriggerStatDTO>> getTriggers(@PathVariable Long userId) {
        List<Object[]> results = distractionRepository.findTriggerCountsByUserId(userId);
        
        long totalCount = 0;
        for (Object[] row : results) {
            totalCount += ((Number) row[1]).longValue();
        }

        List<TriggerStatDTO> dtoList = new ArrayList<>();
        if (totalCount == 0) return ResponseEntity.ok(dtoList);
        
        for (Object[] row : results) {
            String reason = (String) row[0];
            long count = ((Number) row[1]).longValue();
            
            int percentage = (int) Math.round((count * 100.0) / totalCount);
            dtoList.add(new TriggerStatDTO(reason != null ? reason : "Unknown", percentage, count));
        }

        return ResponseEntity.ok(dtoList);
    }

    @GetMapping("/user/{userId}/logs")
    public ResponseEntity<List<com.intellecta.intellecta_backend.dto.response.DistractionLogDTO>> getLogs(@PathVariable Long userId) {
        List<DistractionEntry> entries = distractionRepository.findByUserIdOrderByLoggedAtDesc(userId);
        
        List<com.intellecta.intellecta_backend.dto.response.DistractionLogDTO> dtos = entries.stream()
            .map(e -> com.intellecta.intellecta_backend.dto.response.DistractionLogDTO.builder()
                .id(e.getId())
                .reason(e.getReason())
                .loggedAt(e.getLoggedAt())
                .build())
            .toList();
            
        return ResponseEntity.ok(dtos);
    }
}