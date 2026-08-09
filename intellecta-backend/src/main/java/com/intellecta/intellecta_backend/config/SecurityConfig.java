package com.intellecta.intellecta_backend.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import com.intellecta.intellecta_backend.filter.JwtAuthFilter;
import com.intellecta.intellecta_backend.security.RateLimitingFilter;

@Configuration
public class SecurityConfig {

    @Autowired
    private JwtAuthFilter jwtAuthFilter;

    @Autowired
    private RateLimitingFilter rateLimitingFilter;

    @org.springframework.beans.factory.annotation.Value("${app.cors.allowed-origins:http://localhost:3000}")
    private List<String> allowedOrigins;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .headers(headers -> headers
                .xssProtection(xss -> xss.headerValue(org.springframework.security.web.header.writers.XXssProtectionHeaderWriter.HeaderValue.ENABLED_MODE_BLOCK))
                .contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'self'; script-src 'self'; object-src 'none';"))
                .httpStrictTransportSecurity(hsts -> hsts.includeSubDomains(true).preload(true).maxAgeInSeconds(63072000))
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/api/uploadthing/presign").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/content/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/content/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/content/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/quizzes").hasRole("ADMIN")
                .requestMatchers("/actuator/health").permitAll()
                .requestMatchers("/actuator/**").hasRole("ADMIN")
                .requestMatchers("/api/**").authenticated()
                .anyRequest().permitAll()
            )
            // RateLimitingFilter runs first, then JwtAuthFilter, both before
            // UsernamePasswordAuthenticationFilter (a registered Spring Security filter).
            // Spring Security 7 requires the anchor class to have a registered order;
            // JwtAuthFilter is custom and has none, so we cannot use it as an anchor.
            .addFilterBefore(rateLimitingFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .formLogin(form -> form.disable())
            .httpBasic(h -> h.disable());

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(allowedOrigins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L); // Cache pre-flight response for 1 hour to reduce queueing latency

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}