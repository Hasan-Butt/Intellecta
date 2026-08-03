package com.intellecta.intellecta_backend.dto.request;

import jakarta.validation.constraints.Size;

public record UserUpdateRequestDto(
    @Size(max = 50) String username,
    @Size(max = 50) String role,
    @Size(max = 50) String status
) {
}
