package com.shop.backend.web.orders;

import java.util.List;

public record OrderDto(
    String id,
    String createdAt,
    String status,
    Customer customer,
    List<Item> items,
    double subtotal,
    double discountPercent,
    double total
) {
  public record Customer(String name, String email, String address) {}
  public record Item(String productId, String title, double price, int qty) {}
}