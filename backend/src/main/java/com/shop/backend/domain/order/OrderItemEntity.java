package com.shop.backend.domain.order;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "order_items")
public class OrderItemEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "order_id", nullable = false)
  private Long orderId;

  @Column(name = "product_id")
  private Long productId;

  @Column(name = "product_title_snapshot", nullable = false)
  private String productTitleSnapshot;

  @Column(name = "unit_price_snapshot", nullable = false, precision = 12, scale = 2)
  private BigDecimal unitPriceSnapshot;

  @Column(nullable = false)
  private Integer quantity;

  @Column(name = "line_total", nullable = false, precision = 12, scale = 2)
  private BigDecimal lineTotal;
}