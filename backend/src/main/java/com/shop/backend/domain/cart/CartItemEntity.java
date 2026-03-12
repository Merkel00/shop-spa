package com.shop.backend.domain.cart;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(
    name = "cart_items",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_cart_items_cart_product", columnNames = {"cart_id", "product_id"})
    }
)
public class CartItemEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "cart_id", nullable = false)
  private Long cartId;

  @Column(name = "product_id", nullable = false)
  private Long productId;

  @Column(nullable = false)
  private Integer quantity;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt = Instant.now();

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt = Instant.now();
}