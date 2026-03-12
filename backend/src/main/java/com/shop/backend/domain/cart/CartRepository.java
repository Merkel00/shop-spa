package com.shop.backend.domain.cart;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<CartEntity, Long> {
  Optional<CartEntity> findByUserId(Long userId);
}