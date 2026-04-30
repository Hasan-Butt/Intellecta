package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.dto.request.SubjectRequest;
import com.intellecta.intellecta_backend.dto.response.SubjectResponse;
import java.util.List;

public interface SubjectService {
    SubjectResponse createSubject(Long userId, SubjectRequest request);
    List<SubjectResponse> getAllSubjects(Long userId);
    void deleteSubject(Long userId, Long subjectId);
}