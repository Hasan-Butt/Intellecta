package com.intellecta.intellecta_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// CORS is handled exclusively in SecurityConfig (Security Fix #13).
// WebConfig is intentionally limited to static resource serving only.
@Configuration
public class WebConfig {

    @Bean
    public WebMvcConfigurer resourceHandlerConfigurer() {
        return new WebMvcConfigurer() {
            // Serves files from the uploads/ folder on disk
            @Override
            public void addResourceHandlers(ResourceHandlerRegistry registry) {
                registry.addResourceHandler("/uploads/**")
                        .addResourceLocations("file:uploads/");
            }
        };
    }
}
