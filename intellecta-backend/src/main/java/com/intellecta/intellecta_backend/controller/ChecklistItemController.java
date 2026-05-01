package com.intellecta.intellecta_backend.controller;

import com.intellecta.intellecta_backend.dto.request.ChecklistItemRequest;
import com.intellecta.intellecta_backend.dto.response.ChecklistItemResponse;
import com.intellecta.intellecta_backend.service.ChecklistItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/checklist")
@RequiredArgsConstructor
public class ChecklistItemController {

    private final ChecklistItemService checklistItemService;

    @PostMapping("/exam/{examId}")
    public ResponseEntity<ChecklistItemResponse> createItem(
            @PathVariable Long examId,
            @RequestBody ChecklistItemRequest request) {
        return ResponseEntity.ok(checklistItemService.createItem(examId, request));
    }

    @GetMapping("/exam/{examId}")
    public ResponseEntity<List<ChecklistItemResponse>> getItems(@PathVariable Long examId) {
        return ResponseEntity.ok(checklistItemService.getItemsByExam(examId));
    }

    @PatchMapping("/{itemId}/toggle")
    public ResponseEntity<ChecklistItemResponse> toggleDone(@PathVariable Long itemId) {
        return ResponseEntity.ok(checklistItemService.toggleDone(itemId));
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long itemId) {
        checklistItemService.deleteItem(itemId);
        return ResponseEntity.noContent().build();
    }
}