package com.shop.backend.domain.promo;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PromoCodeRepository extends JpaRepository<PromoCodeEntity, Long> {
  Optional<PromoCodeEntity> findByCodeIgnoreCase(String code);
}