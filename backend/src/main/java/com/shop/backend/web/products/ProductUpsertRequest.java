package com.shop.backend.web.products;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record ProductUpsertRequest(
    @NotBlank @Size(min = 2, max = 200)
    String title,

    @NotNull @DecimalMin(value = "0.00", inclusive = true)
    BigDecimal price,

    @NotBlank @Size(min = 2, max = 100)
    String category,

    @NotBlank @Size(min = 10, max = 2000)
    String description,

    @NotBlank
    String image,

    @NotNull @Min(0)
    Integer stock
) {}