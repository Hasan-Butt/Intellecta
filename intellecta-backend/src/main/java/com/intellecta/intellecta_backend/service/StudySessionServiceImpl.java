package com.intellecta.intellecta_backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.intellecta.intellecta_backend.dto.request.StudySessionRequest;
import com.intellecta.intellecta_backend.dto.response.StudySessionResponse;
import com.intellecta.intellecta_backend.model.StudySession;
import com.intellecta.intellecta_backend.model.User;
import com.intellecta.intellecta_backend.repository.StudySessionRepository;
import com.intellecta.intellecta_backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StudySessionServiceImpl implements StudySessionService {

    private final StudySessionRepository sessionRepository;
    private final UserRepository userRepository;

    @Override
    public StudySessionResponse startSession(Long userId, StudySessionRequest req) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        StudySession session = StudySession.builder()
            .user(user)
            .subject(req.getSubject())
            .startTime(req.getStartTime() != null
                ? req.getStartTime() : LocalDateTime.now())
            .deepWork(req.isDeepWork())
            .pomodorosCompleted(0)
            .build();

        return toResponse(sessionRepository.save(session));
    }

    @Override
    public StudySessionResponse endSession(Long sessionId, StudySessionRequest request) {
        StudySession session = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new RuntimeException("Session not found"));
        session.setEndTime(LocalDateTime.now());
        
        if (request != null) {
            session.setPomodorosCompleted(request.getPomodorosCompleted());
            
            // 50 XP per completed pomodoro
            int xpGained = request.getPomodorosCompleted() * 50;
            
            // If they didn't finish a full pomodoro but spent time, give partial XP
            if (xpGained == 0 && session.getStartTime() != null) {
                long durationMinutes = java.time.Duration.between(session.getStartTime(), session.getEndTime()).toMinutes();
                if (durationMinutes > 0) {
                    xpGained = (int) (durationMinutes * 2); // 2 XP per minute
                }
            }
            
            if (xpGained > 0) {
                User user = session.getUser();
                user.setXp(user.getXp() + xpGained);
                userRepository.save(user);
            }
        }
        
        return toResponse(sessionRepository.save(session));
    }

    @Override
    public List<StudySessionResponse> getUserSessions(Long userId) {
        return sessionRepository.findByUserIdOrderByStartTimeDesc(userId)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    private StudySessionResponse toResponse(StudySession s) {
        return StudySessionResponse.builder()
            .id(s.getId())
            .subject(s.getSubject())
            .startTime(s.getStartTime())
            .endTime(s.getEndTime())
            .pomodorosCompleted(s.getPomodorosCompleted())
            .deepWork(s.isDeepWork())
            .durationMinutes(s.getDurationMinutes())
            .build();
    }
}