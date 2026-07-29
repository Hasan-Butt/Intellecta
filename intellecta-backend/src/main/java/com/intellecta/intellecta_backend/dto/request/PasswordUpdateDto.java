package com.intellecta.intellecta_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PasswordUpdateDto(
    @NotBlank @Size(max = 128) String currentPassword,
    @NotBlank @Size(max = 128) String newPassword
) {}
