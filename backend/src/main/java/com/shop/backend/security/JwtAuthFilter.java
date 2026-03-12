package com.shop.backend.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

  private final JwtService jwt;

  public JwtAuthFilter(JwtService jwt) {
    this.jwt = jwt;
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
      throws ServletException, IOException {

    String header = request.getHeader("Authorization");
    if (header == null || !header.startsWith("Bearer ")) {
      chain.doFilter(request, response);
      return;
    }

    String token = header.substring("Bearer ".length()).trim();

    try {
      Claims c = jwt.parse(token);

      String userId = c.getSubject();
      String role = String.valueOf(c.get("role"));

      var auth = new UsernamePasswordAuthenticationToken(
          userId,
          null,
          List.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
      );

      SecurityContextHolder.getContext().setAuthentication(auth);
    } catch (Exception ignored) {
      SecurityContextHolder.clearContext();
    }

    chain.doFilter(request, response);
  }
}