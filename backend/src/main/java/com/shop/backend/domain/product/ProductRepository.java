package com.shop.backend.domain.product;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<ProductEntity, Long> {

  List<ProductEntity> findByIsActiveTrue(Sort sort);

  Optional<ProductEntity> findByIdAndIsActiveTrue(Long id);

  Page<ProductEntity> findByIsActiveTrue(Pageable pageable);

  Page<ProductEntity> findByIsActiveTrueAndTitleContainingIgnoreCase(
      String title,
      Pageable pageable
  );

  Page<ProductEntity> findByIsActiveTrueAndCategoryIgnoreCase(
      String category,
      Pageable pageable
  );

  Page<ProductEntity> findByIsActiveTrueAndCategoryIgnoreCaseAndTitleContainingIgnoreCase(
      String category,
      String title,
      Pageable pageable
  );
}