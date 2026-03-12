package com.shop.backend.domain.product;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "products")
public class ProductEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String title;

  @Column(columnDefinition = "text")
  private String description;

  @Column(nullable = false, precision = 12, scale = 2)
  private BigDecimal price;

  @Column(name = "image_url", columnDefinition = "text")
  private String imageUrl;

  private String category;
  private String brand;

  @Column(precision = 3, scale = 2)
  private BigDecimal rating;

  @Column(name = "stock_quantity", nullable = false)
  private Integer stockQuantity = 0;

  @Column(name = "is_active", nullable = false)
  private Boolean isActive = true;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt = Instant.now();

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt = Instant.now();
}