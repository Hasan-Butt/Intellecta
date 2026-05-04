package com.intellecta.intellecta_backend.dto.response;

import lombok.*;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ModeratorStatusDto {
    private long         moderatorCount;
    private long         extraCount;
    private List<String> avatars;
    private long         liveNodes;
    private double       integrityScore;
}
