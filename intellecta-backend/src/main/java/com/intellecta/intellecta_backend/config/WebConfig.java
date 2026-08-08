package com.intellecta.intellecta_backend.config;

import org.springframework.context.annotation.Configuration;

/**
 * WebConfig — previously served static files from disk via /uploads/**.
 * Now that all file storage is on UploadThing CDN, local file serving
 * is no longer needed. This class is retained as a placeholder.
 *
 * CORS is handled exclusively in SecurityConfig (Security Fix #13).
 */
@Configuration
public class WebConfig {
    // No resource handlers needed — files are served from UploadThing CDN.
}
