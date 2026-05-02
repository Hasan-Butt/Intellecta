package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.dto.request.ChecklistItemRequest;
import com.intellecta.intellecta_backend.dto.response.ChecklistItemResponse;
import java.util.List;

public interface ChecklistItemService {
    ChecklistItemResponse createItem(Long examId, ChecklistItemRequest request);
    List<ChecklistItemResponse> getItemsByExam(Long examId);
    ChecklistItemResponse toggleDone(Long itemId);
    void deleteItem(Long itemId);
}