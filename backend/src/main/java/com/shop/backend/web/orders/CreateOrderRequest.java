package com.shop.backend.web.orders;

import jakarta.validation.constraints.NotBlank;

public record CreateOrderRequest(
    @NotBlank String shippingAddress,
    String promoCode
) {}