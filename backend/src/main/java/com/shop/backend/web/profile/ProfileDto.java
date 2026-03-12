package com.shop.backend.web.profile;

import jakarta.validation.constraints.NotBlank;

public record ProfileDto(
    @NotBlank String id,
    @NotBlank String email,
    @NotBlank String name,
    String phone,
    String address,
    Preferences preferences
) {
  public record Preferences(
      String theme,
      Boolean newsletter,
      String favoriteCategory
  ) {}
}