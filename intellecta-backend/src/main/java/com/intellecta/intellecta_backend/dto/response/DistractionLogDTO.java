package com.intellecta.intellecta_backend.dto.response;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DistractionLogDTO {
    private Long id;
    private String reason;
    private LocalDateTime loggedAt;
}
