package com.shop.backend.web.products;

import java.math.BigDecimal;

public record ProductDto(
    Long id,
    String title,
    BigDecimal price,
    String category,
    String description,
    String image,
    Integer stock
) {}