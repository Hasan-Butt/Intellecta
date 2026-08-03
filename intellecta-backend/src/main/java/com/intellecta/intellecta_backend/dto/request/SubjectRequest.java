package com.intellecta.intellecta_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SubjectRequest {
    @NotBlank @Size(max = 100)
    private String name;

    @NotBlank @Size(max = 50)
    private String semester;

    @Size(max = 7)
    private String color;
}