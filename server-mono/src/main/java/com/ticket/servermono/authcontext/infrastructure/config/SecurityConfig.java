package com.ticket.servermono.authcontext.infrastructure.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JWTRequestFilter jwtRequestFilter;
    
    public SecurityConfig(JWTRequestFilter jwtRequestFilter) {
        this.jwtRequestFilter = jwtRequestFilter;
            }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {        http
            .csrf(AbstractHttpConfigurer::disable)  // Disable CSRF protection
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)  // Stateless session management
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()  // Allow OPTIONS requests
                .requestMatchers("/ws/**").permitAll()  // Allow all WebSocket connections
                .requestMatchers("/v1/admin/**").denyAll()  // Chỉ chặn admin endpoints
                .requestMatchers("/v1/booking").authenticated()  // Yêu cầu xác thực cho /v1/booking
                                .anyRequest().permitAll()  // Allow all other requests
            );

        // Add the JWTRequestFilter before UsernamePasswordAuthenticationFilter
        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
