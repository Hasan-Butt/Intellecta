package com.intellecta.intellecta_backend.config;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException e) {
        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError fe : e.getBindingResult().getFieldErrors()) {
            fieldErrors.put(fe.getField(), fe.getDefaultMessage());
        }
        return ResponseEntity.badRequest().body(Map.of("error", "Validation failed", "fields", fieldErrors));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDenied(AccessDeniedException e) {
        return ResponseEntity.status(401).body(Map.of("error", "Unauthorized", "message", e.getMessage()));
    }

    // Intentional "bad request" exceptions thrown by service/controller code
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(Map.of("error", "Bad Request", "message", e.getMessage()));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleIllegalState(IllegalStateException e) {
        return ResponseEntity.badRequest().body(Map.of("error", "Bad Request", "message", e.getMessage()));
    }

    // Intentional RuntimeExceptions thrown with a message (e.g. "User not found", "Quiz already attempted")
    // are still caught here, but now as 500 so they don't mask real bugs as client errors.
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntime(RuntimeException e) {
        e.printStackTrace();
        return ResponseEntity.status(500).body(Map.of(
            "error", "Internal Server Error",
            "message", e.getMessage() != null ? e.getMessage() : "An unexpected error occurred"
        ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneric(Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(500).body(Map.of("error", "Internal Server Error", "message", "An unexpected error occurred"));
    }
}
