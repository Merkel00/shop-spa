package com.shop.backend.domain.promo;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "promo_codes")
public class PromoCodeEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true)
  private String code;

  @Column(name = "discount_percent", nullable = false, precision = 5, scale = 2)
  private BigDecimal discountPercent = BigDecimal.ZERO;

  @Column(name = "is_active", nullable = false)
  private Boolean isActive = true;

  @Column(name = "expires_at")
  private Instant expiresAt;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt = Instant.now();
}