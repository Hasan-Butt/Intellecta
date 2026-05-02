package com.intellecta.intellecta_backend.service;

import java.util.List;

import com.intellecta.intellecta_backend.dto.request.StudySessionRequest;
import com.intellecta.intellecta_backend.dto.response.StudySessionResponse;

public interface StudySessionService {
    StudySessionResponse startSession(Long userId, StudySessionRequest request);
    StudySessionResponse endSession(Long sessionId);
    List<StudySessionResponse> getUserSessions(Long userId);
}