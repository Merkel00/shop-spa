package com.shop.backend.web.products;

import com.shop.backend.domain.product.ProductEntity;
import com.shop.backend.domain.product.ProductRepository;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

import static org.springframework.http.HttpStatus.*;

@RestController
@RequestMapping("/api/products")
public class ProductsController {

  private final ProductRepository repo;

  public ProductsController(ProductRepository repo) {
    this.repo = repo;
  }

  @GetMapping
  public Page<ProductDto> list(
      @RequestParam(required = false) String search,
      @RequestParam(required = false) String category,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "8") int size,
      @RequestParam(defaultValue = "id,asc") String sort
  ) {
    Pageable pageable = PageRequest.of(page, size, parseSort(sort));

    String normalizedSearch = search == null ? "" : search.trim();
    String normalizedCategory = category == null ? "" : category.trim();

    boolean hasSearch = !normalizedSearch.isBlank();
    boolean hasCategory = !normalizedCategory.isBlank();

    Page<ProductEntity> result;

    if (hasSearch && hasCategory) {
      result = repo.findByIsActiveTrueAndCategoryIgnoreCaseAndTitleContainingIgnoreCase(
          normalizedCategory,
          normalizedSearch,
          pageable
      );
    } else if (hasSearch) {
      result = repo.findByIsActiveTrueAndTitleContainingIgnoreCase(
          normalizedSearch,
          pageable
      );
    } else if (hasCategory) {
      result = repo.findByIsActiveTrueAndCategoryIgnoreCase(
          normalizedCategory,
          pageable
      );
    } else {
      result = repo.findByIsActiveTrue(pageable);
    }

    return result.map(this::toDto);
  }

  @GetMapping("/categories")
  public List<String> categories() {
    return repo.findByIsActiveTrue(Sort.by(Sort.Direction.ASC, "category"))
        .stream()
        .map(ProductEntity::getCategory)
        .filter(category -> category != null && !category.isBlank())
        .map(String::trim)
        .distinct()
        .toList();
  }

  @GetMapping("/all")
  public List<ProductDto> all() {
    return repo.findByIsActiveTrue(Sort.by(Sort.Direction.ASC, "id"))
        .stream()
        .map(this::toDto)
        .toList();
  }

  @GetMapping("/{id}")
  public ProductDto getById(@PathVariable Long id) {
    var p = repo.findByIdAndIsActiveTrue(id)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Product not found"));
    return toDto(p);
  }

  @PostMapping
  @ResponseStatus(CREATED)
  public ProductDto create(@Valid @RequestBody ProductUpsertRequest req) {
    var p = new ProductEntity();
    apply(p, req);
    p.setIsActive(true);
    p.setCreatedAt(Instant.now());
    p.setUpdatedAt(Instant.now());
    return toDto(repo.save(p));
  }

  @PutMapping("/{id}")
  public ProductDto update(@PathVariable Long id, @Valid @RequestBody ProductUpsertRequest req) {
    var p = repo.findById(id)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Product not found"));

    apply(p, req);
    p.setUpdatedAt(Instant.now());
    return toDto(repo.save(p));
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(NO_CONTENT)
  public void delete(@PathVariable Long id) {
    var p = repo.findById(id)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Product not found"));

    p.setIsActive(false);
    p.setUpdatedAt(Instant.now());
    repo.save(p);
  }

  private Sort parseSort(String sort) {
    if (sort == null || sort.isBlank()) {
      return Sort.by(Sort.Direction.ASC, "id");
    }

    String[] parts = sort.split(",");
    String field = parts[0].trim();
    String directionRaw = parts.length > 1 ? parts[1].trim() : "asc";

    Sort.Direction direction = "desc".equalsIgnoreCase(directionRaw)
        ? Sort.Direction.DESC
        : Sort.Direction.ASC;

    return switch (field) {
      case "price" -> Sort.by(direction, "price");
      case "title" -> Sort.by(direction, "title");
      case "createdAt" -> Sort.by(direction, "createdAt");
      case "id" -> Sort.by(direction, "id");
      default -> Sort.by(Sort.Direction.ASC, "id");
    };
  }

  private void apply(ProductEntity p, ProductUpsertRequest req) {
    p.setTitle(req.title());
    p.setPrice(req.price());
    p.setCategory(req.category());
    p.setDescription(req.description());
    p.setImageUrl(req.image());
    p.setStockQuantity(req.stock());
  }

  private ProductDto toDto(ProductEntity p) {
    return new ProductDto(
        p.getId(),
        p.getTitle(),
        p.getPrice(),
        p.getCategory(),
        p.getDescription(),
        p.getImageUrl(),
        p.getStockQuantity()
    );
  }
}