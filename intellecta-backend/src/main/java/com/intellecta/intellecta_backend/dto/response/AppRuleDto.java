package com.intellecta.intellecta_backend.dto.response;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AppRuleDto {
    private Long   id;
    private String appName;
    private String type;
    private String createdAt;
}
