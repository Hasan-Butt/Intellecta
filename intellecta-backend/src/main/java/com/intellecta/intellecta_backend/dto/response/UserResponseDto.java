package com.intellecta.intellecta_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class UserResponseDto {
    private Long id;
    private String username;
    private String email;
    private String role;
    private String status;
}