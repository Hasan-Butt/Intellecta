package com.intellecta.intellecta_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ExamRequest {
    @NotBlank @Size(max = 200)
    private String name;

    @NotBlank
    private String examDate; // "YYYY-MM-DD"

    @NotNull
    private Long subjectId;
}