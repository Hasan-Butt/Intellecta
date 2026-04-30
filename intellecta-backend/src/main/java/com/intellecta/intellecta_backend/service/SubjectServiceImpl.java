package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.dto.request.SubjectRequest;
import com.intellecta.intellecta_backend.dto.response.SubjectResponse;
import com.intellecta.intellecta_backend.model.Subject;
import com.intellecta.intellecta_backend.model.User;
import com.intellecta.intellecta_backend.repository.DocumentRepository;
import com.intellecta.intellecta_backend.repository.SubjectRepository;
import com.intellecta.intellecta_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubjectServiceImpl implements SubjectService {

    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;

    @Override
    public SubjectResponse createSubject(Long userId, SubjectRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        Subject subject = Subject.builder()
            .name(request.getName())
            .semester(request.getSemester())
            .color(request.getColor())
            .user(user)
            .build();

        return toResponse(subjectRepository.save(subject));
    }

    @Override
    public List<SubjectResponse> getAllSubjects(Long userId) {
        return subjectRepository.findByUserIdOrderBySemesterAscNameAsc(userId)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public void deleteSubject(Long userId, Long subjectId) {
        Subject subject = subjectRepository.findById(subjectId)
            .orElseThrow(() -> new RuntimeException("Subject not found"));
        if (!subject.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }
        subjectRepository.delete(subject);
    }

    private SubjectResponse toResponse(Subject subject) {
        long count = documentRepository
            .findByUserIdAndSubjectOrderByUploadDateDesc(
                subject.getUser().getId(), subject.getName())
            .size();

        return SubjectResponse.builder()
            .id(subject.getId())
            .name(subject.getName())
            .semester(subject.getSemester())
            .color(subject.getColor())
            .documentCount(count)
            .build();
    }
}