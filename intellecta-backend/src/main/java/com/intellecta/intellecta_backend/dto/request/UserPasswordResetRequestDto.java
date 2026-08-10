package com.intellecta.intellecta_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserPasswordResetRequestDto(
    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 128, message = "Password must be between 6 and 128 characters")
    String password,

    @NotBlank(message = "Password confirmation is required")
    String confirmPassword
) {}