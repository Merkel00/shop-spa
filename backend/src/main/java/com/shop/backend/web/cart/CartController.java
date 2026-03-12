package com.shop.backend.web.cart;

import com.shop.backend.domain.cart.CartEntity;
import com.shop.backend.domain.cart.CartItemEntity;
import com.shop.backend.domain.cart.CartItemRepository;
import com.shop.backend.domain.cart.CartRepository;
import com.shop.backend.domain.product.ProductEntity;
import com.shop.backend.domain.product.ProductRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@RestController
@RequestMapping("/api/cart")
public class CartController {

  private final CartRepository carts;
  private final CartItemRepository cartItems;
  private final ProductRepository products;

  public CartController(
      CartRepository carts,
      CartItemRepository cartItems,
      ProductRepository products
  ) {
    this.carts = carts;
    this.cartItems = cartItems;
    this.products = products;
  }

  @GetMapping
  public CartDto getCart(Authentication auth) {
    Long userId = requireUserId(auth);
    CartEntity cart = getOrCreateCart(userId);
    return toDto(cart);
  }

  @PostMapping("/items")
  @Transactional
  public CartDto addItem(@RequestBody AddCartItemRequest req, Authentication auth) {
    Long userId = requireUserId(auth);
    CartEntity cart = getOrCreateCart(userId);

    ProductEntity product = products.findByIdAndIsActiveTrue(req.productId())
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Product not found"));

    CartItemEntity item = cartItems.findByCartIdAndProductId(cart.getId(), product.getId())
        .orElseGet(() -> {
          CartItemEntity x = new CartItemEntity();
          x.setCartId(cart.getId());
          x.setProductId(product.getId());
          x.setQuantity(0);
          x.setCreatedAt(Instant.now());
          x.setUpdatedAt(Instant.now());
          return x;
        });

    int nextQty = item.getQuantity() + Math.max(1, req.qty());
    int stock = product.getStockQuantity() == null ? 0 : product.getStockQuantity();

    if (nextQty > stock) {
        throw new ResponseStatusException(BAD_REQUEST, "Not enough stock");
    }

    item.setQuantity(nextQty);
    item.setUpdatedAt(Instant.now());
    cartItems.save(item);

    cart.setUpdatedAt(Instant.now());
    carts.save(cart);

    return toDto(cart);
  }

  @PutMapping("/items/{itemId}")
  @Transactional
  public CartDto updateItem(
      @PathVariable Long itemId,
      @RequestBody UpdateCartItemRequest req,
      Authentication auth
  ) {
    Long userId = requireUserId(auth);
    CartEntity cart = getOrCreateCart(userId);

    CartItemEntity item = cartItems.findById(itemId)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Cart item not found"));

    if (!item.getCartId().equals(cart.getId())) {
      throw new ResponseStatusException(NOT_FOUND, "Cart item not found");
    }

    if (req.qty() <= 0) {
      cartItems.delete(item);
    } else {
      ProductEntity product = products.findByIdAndIsActiveTrue(item.getProductId())
    .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Product not found"));

int stock = product.getStockQuantity() == null ? 0 : product.getStockQuantity();
if (req.qty() > stock) {
  throw new ResponseStatusException(BAD_REQUEST, "Not enough stock");
}
      item.setQuantity(req.qty());
      item.setUpdatedAt(Instant.now());
      cartItems.save(item);
    }

    cart.setUpdatedAt(Instant.now());
    carts.save(cart);

    return toDto(cart);
  }

  @DeleteMapping("/items/{itemId}")
  @Transactional
  public CartDto removeItem(@PathVariable Long itemId, Authentication auth) {
    Long userId = requireUserId(auth);
    CartEntity cart = getOrCreateCart(userId);

    CartItemEntity item = cartItems.findById(itemId)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Cart item not found"));

    if (!item.getCartId().equals(cart.getId())) {
      throw new ResponseStatusException(NOT_FOUND, "Cart item not found");
    }

    cartItems.delete(item);

    cart.setUpdatedAt(Instant.now());
    carts.save(cart);

    return toDto(cart);
  }

  @DeleteMapping("/clear")
  @Transactional
  public CartDto clear(Authentication auth) {
    Long userId = requireUserId(auth);
    CartEntity cart = getOrCreateCart(userId);

    cartItems.deleteByCartId(cart.getId());
    cart.setUpdatedAt(Instant.now());
    carts.save(cart);

    return toDto(cart);
  }

  private CartEntity getOrCreateCart(Long userId) {
    return carts.findByUserId(userId).orElseGet(() -> {
      CartEntity cart = new CartEntity();
      cart.setUserId(userId);
      cart.setCreatedAt(Instant.now());
      cart.setUpdatedAt(Instant.now());
      return carts.save(cart);
    });
  }

  private CartDto toDto(CartEntity cart) {
    List<CartItemDto> items = cartItems.findByCartId(cart.getId()).stream()
        .map(item -> {
          ProductEntity p = products.findByIdAndIsActiveTrue(item.getProductId())
              .orElse(null);

          if (p == null) return null;

          return new CartItemDto(
              item.getId(),
              item.getQuantity(),
              new ProductShortDto(
                  p.getId(),
                  p.getTitle(),
                  p.getPrice(),
                  p.getCategory(),
                  p.getDescription(),
                  p.getImageUrl(),
                  p.getStockQuantity()
              )
          );
        })
        .filter(x -> x != null)
        .toList();

    BigDecimal total = items.stream()
        .map(i -> i.product().price().multiply(BigDecimal.valueOf(i.qty())))
        .reduce(BigDecimal.ZERO, BigDecimal::add);

    int count = items.stream()
        .mapToInt(CartItemDto::qty)
        .sum();

    return new CartDto(items, total.doubleValue(), count);
  }

  private Long requireUserId(Authentication auth) {
    if (auth == null || auth.getName() == null) {
      throw new ResponseStatusException(UNAUTHORIZED, "Unauthenticated");
    }
    return Long.parseLong(auth.getName());
  }

  public record AddCartItemRequest(
      @NotNull Long productId,
      @Min(1) int qty
  ) {}

  public record UpdateCartItemRequest(
      @Min(0) int qty
  ) {}

  public record CartDto(
      List<CartItemDto> items,
      double total,
      int count
  ) {}

  public record CartItemDto(
      Long id,
      int qty,
      ProductShortDto product
  ) {}

  public record ProductShortDto(
      Long id,
      String title,
      BigDecimal price,
      String category,
      String description,
      String image,
      Integer stock
  ) {}
}