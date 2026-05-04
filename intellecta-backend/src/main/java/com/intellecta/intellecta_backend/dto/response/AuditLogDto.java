package com.intellecta.intellecta_backend.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogDto {
    private String timestamp;  // "HH:mm:ss"
    private String userId;     // "u_username"
    private String event;      // e.g. "Focus Session — Mathematics"
    private String status;     // COMPLETED | IN_PROGRESS | LOGGED
}
