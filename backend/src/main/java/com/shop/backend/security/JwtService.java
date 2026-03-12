package com.shop.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {

  private final SecretKey key;
  private final long ttlSeconds;

  public JwtService(
      @Value("${app.jwt.secret}") String secret,
      @Value("${app.jwt.ttl-seconds:86400}") long ttlSeconds
  ) {
    this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    this.ttlSeconds = ttlSeconds;
  }

  public String generate(Long userId, String email, String role) {
    Instant now = Instant.now();
    Instant exp = now.plusSeconds(ttlSeconds);

    return Jwts.builder()
        .subject(String.valueOf(userId))
        .claim("email", email)
        .claim("role", role)
        .issuedAt(Date.from(now))
        .expiration(Date.from(exp))
        .signWith(key)
        .compact();
  }

  public Claims parse(String token) {
    return Jwts.parser()
        .verifyWith(key)
        .build()
        .parseSignedClaims(token)
        .getPayload();
  }
}