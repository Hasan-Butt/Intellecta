package com.intellecta.intellecta_backend.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data @Builder
public class DistractionSummaryDTO {
    private String mostRecentReason;    // "Instagram Loop"
    private String mostRecentTimeAgo;   // "17m ago"
    private List<Long> dailyCounts;     // 7 values Mon→Sun for mini chart
}