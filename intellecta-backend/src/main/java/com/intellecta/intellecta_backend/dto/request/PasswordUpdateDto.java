package com.intellecta.intellecta_backend.dto.request;

public record PasswordUpdateDto(
    String currentPassword,
    String newPassword
) {}
