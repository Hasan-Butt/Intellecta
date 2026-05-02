package com.intellecta.intellecta_backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class LeaderboardEntryDTO {
    private int    rank;
    private Long   userId;
    private String username;
    private long   focusHours;
    private long   xp;
    private boolean isCurrentUser;
}