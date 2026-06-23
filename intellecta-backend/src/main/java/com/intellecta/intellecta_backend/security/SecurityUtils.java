package com.intellecta.intellecta_backend.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtils {
    private static final Logger log = LoggerFactory.getLogger(SecurityUtils.class);

    public static UserPrincipal getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            log.warn("Access Denied: Unauthenticated access attempt");
            throw new AccessDeniedException("Access Denied: User is not authenticated");
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserPrincipal) {
            return (UserPrincipal) principal;
        }
        log.warn("Access Denied: Invalid security principal of type {}", principal != null ? principal.getClass().getName() : "null");
        throw new AccessDeniedException("Access Denied: Invalid security principal");
    }

    public static void validateUser(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID parameter cannot be null");
        }
        UserPrincipal principal = getAuthenticatedUser();
        if (!principal.getId().equals(userId) && !principal.getRole().equals("ADMIN")) {
            log.error("AUDIT - Security Violation: User {} (ID {}) attempted to access resource of user with ID {}", 
                principal.getUsername(), principal.getId(), userId);
            throw new AccessDeniedException("Access Denied: You are not authorized to access resources for user ID " + userId);
        }
        if (principal.getRole().equals("ADMIN") && !principal.getId().equals(userId)) {
            log.info("AUDIT - Admin Override: Admin {} (ID {}) accessed resource of user with ID {}", 
                principal.getUsername(), principal.getId(), userId);
        }
    }

    public static void validateAdmin() {
        UserPrincipal principal = getAuthenticatedUser();
        if (!principal.getRole().equals("ADMIN")) {
            log.error("AUDIT - Privilege Escalation Attempt: User {} (ID {}, Role {}) attempted admin action", 
                principal.getUsername(), principal.getId(), principal.getRole());
            throw new AccessDeniedException("Access Denied: Administrator role required");
        }
        log.info("AUDIT - Admin Action: Admin {} (ID {}) performed administrative action", 
            principal.getUsername(), principal.getId());
    }
}
