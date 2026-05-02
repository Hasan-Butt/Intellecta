package com.intellecta.intellecta_backend.dto.request;

public record UserCreateRequestDto(String username, String email, String password, String role) {
}
