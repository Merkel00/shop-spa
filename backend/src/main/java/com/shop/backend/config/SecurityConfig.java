package com.shop.backend.config;

import com.shop.backend.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

  @Bean
  PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthFilter jwtFilter) throws Exception {
    return http
        .csrf(csrf -> csrf.disable())
        .cors(cors -> {})
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/promoCodes/**").permitAll()

            .requestMatchers(HttpMethod.POST, "/api/products/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.PUT, "/api/products/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")

            .requestMatchers("/api/orders/**").authenticated()
            .requestMatchers("/api/profiles/**").authenticated()
            .requestMatchers("/api/cart/**").authenticated()

            .anyRequest().permitAll()
        )
        .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
        .build();
  }
}