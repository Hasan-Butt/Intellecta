package com.intellecta.intellecta_backend.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemIntegrityDto {
    private int    integrityScore;
    private int    systemLoad;
    private String nodeStatus;
    private long   totalSessions;
    private long   concurrentSessions;
    private double quizCompletionRate;
    private long   activeUsers;
    private long   totalUsers;
}
