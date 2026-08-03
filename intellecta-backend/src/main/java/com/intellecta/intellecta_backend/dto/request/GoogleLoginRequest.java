package com.intellecta.intellecta_backend.dto.request;

import jakarta.validation.constraints.NotBlank;

public class GoogleLoginRequest {
    @NotBlank
    private String idToken;

    public GoogleLoginRequest() {}

    public GoogleLoginRequest(String idToken) {
        this.idToken = idToken;
    }

    public String getIdToken() {
        return idToken;
    }

    public void setIdToken(String idToken) {
        this.idToken = idToken;
    }
}
