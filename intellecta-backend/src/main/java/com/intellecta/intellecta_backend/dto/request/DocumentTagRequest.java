package com.intellecta.intellecta_backend.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class DocumentTagRequest {
    private List<String> tags;
}