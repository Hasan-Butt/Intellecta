package com.intellecta.intellecta_backend.security;

import com.intellecta.intellecta_backend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Date;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenBlacklistService {

    @Autowired
    private JwtUtil jwtUtil;

    private final ConcurrentHashMap<String, Date> blacklist = new ConcurrentHashMap<>();

    public void blacklist(String token) {
        if (token == null || token.isBlank()) return;
        try {
            Date expiresAt = jwtUtil.extractExpiration(token);
            blacklist.put(token, expiresAt);
        } catch (Exception e) {
            // Invalid tokens have nothing to revoke
        }
    }

    public boolean isBlacklisted(String token) {
        if (token == null) return false;
        purgeExpired();
        return blacklist.containsKey(token);
    }

    private void purgeExpired() {
        Instant now = Instant.now();
        blacklist.entrySet().removeIf(entry -> entry.getValue().toInstant().isBefore(now));
    }
}