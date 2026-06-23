package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.dto.request.ChecklistItemRequest;
import com.intellecta.intellecta_backend.dto.response.ChecklistItemResponse;
import com.intellecta.intellecta_backend.model.ChecklistItem;
import com.intellecta.intellecta_backend.model.Exam;
import com.intellecta.intellecta_backend.repository.ChecklistItemRepository;
import com.intellecta.intellecta_backend.repository.ExamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import com.intellecta.intellecta_backend.security.SecurityUtils;

@Service
@RequiredArgsConstructor
public class ChecklistItemServiceImpl implements ChecklistItemService {

    private final ChecklistItemRepository checklistItemRepository;
    private final ExamRepository examRepository;

    @Override
    public ChecklistItemResponse createItem(Long examId, ChecklistItemRequest request) {
        Exam exam = examRepository.findById(examId)
            .orElseThrow(() -> new RuntimeException("Exam not found"));
        SecurityUtils.validateUser(exam.getSubject().getUser().getId());

        ChecklistItem item = ChecklistItem.builder()
            .description(request.getDescription())
            .done(false)
            .exam(exam)
            .build();

        return toResponse(checklistItemRepository.save(item));
    }

    @Override
    public List<ChecklistItemResponse> getItemsByExam(Long examId) {
        Exam exam = examRepository.findById(examId)
            .orElseThrow(() -> new RuntimeException("Exam not found"));
        SecurityUtils.validateUser(exam.getSubject().getUser().getId());

        return checklistItemRepository.findByExamIdOrderByIdAsc(examId)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public ChecklistItemResponse toggleDone(Long itemId) {
        ChecklistItem item = checklistItemRepository.findById(itemId)
            .orElseThrow(() -> new RuntimeException("Item not found"));
        SecurityUtils.validateUser(item.getExam().getSubject().getUser().getId());

        item.setDone(!item.isDone());
        return toResponse(checklistItemRepository.save(item));
    }

    @Override
    public void deleteItem(Long itemId) {
        ChecklistItem item = checklistItemRepository.findById(itemId)
            .orElseThrow(() -> new RuntimeException("Item not found"));
        SecurityUtils.validateUser(item.getExam().getSubject().getUser().getId());

        checklistItemRepository.delete(item);
    }

    private ChecklistItemResponse toResponse(ChecklistItem item) {
        return ChecklistItemResponse.builder()
            .id(item.getId())
            .description(item.getDescription())
            .done(item.isDone())
            .examId(item.getExam().getId())
            .build();
    }
}