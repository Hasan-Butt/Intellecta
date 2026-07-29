package com.intellecta.intellecta_backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserCreateRequestDto(
    @NotBlank @Size(max = 50) String username,
    @NotBlank @Email String email,
    @NotBlank @Size(max = 128) String password,
    @NotBlank String role
) {
}
