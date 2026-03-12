package com.shop.backend.domain.cart;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItemEntity, Long> {
  List<CartItemEntity> findByCartId(Long cartId);
  Optional<CartItemEntity> findByCartIdAndProductId(Long cartId, Long productId);
  void deleteByCartId(Long cartId);
}