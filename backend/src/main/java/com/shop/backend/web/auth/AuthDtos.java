package com.shop.backend.web.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDtos {

  public record RegisterRequest(
      @NotBlank(message = "Email is required")
      @Email(message = "Invalid email format")
      String email,

      @NotBlank(message = "Password is required")
      @Size(min = 6, max = 100, message = "Password must be at least 6 characters")
      String password,

      @NotBlank(message = "Name is required")
      @Size(min = 2, max = 80, message = "Name must be at least 2 characters")
      String name
  ) {}

  public record LoginRequest(
      @NotBlank(message = "Email is required")
      @Email(message = "Invalid email format")
      String email,

      @NotBlank(message = "Password is required")
      String password
  ) {}

  public record UserDto(Long id, String email, String role) {}
  public record AuthResponse(String token, UserDto user) {}
}