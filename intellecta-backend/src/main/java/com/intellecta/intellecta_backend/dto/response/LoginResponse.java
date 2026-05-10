package com.intellecta.intellecta_backend.dto.response;

import com.intellecta.intellecta_backend.enums.UserRoles;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private Long userId;
    private String email;
    private UserRoles role;
}
