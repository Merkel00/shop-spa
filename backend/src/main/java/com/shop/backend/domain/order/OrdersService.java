package com.shop.backend.domain.order;

import com.shop.backend.domain.cart.CartEntity;
import com.shop.backend.domain.cart.CartItemEntity;
import com.shop.backend.domain.cart.CartItemRepository;
import com.shop.backend.domain.cart.CartRepository;
import com.shop.backend.domain.product.ProductEntity;
import com.shop.backend.domain.product.ProductRepository;
import com.shop.backend.domain.promo.PromoCodeEntity;
import com.shop.backend.domain.promo.PromoCodeRepository;
import com.shop.backend.web.orders.CreateOrderRequest;
import com.shop.backend.web.orders.OrderDto;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import com.shop.backend.domain.user.UserEntity;
import com.shop.backend.domain.user.UserRepository;
import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class OrdersService {

  private final OrderRepository orders;
  private final OrderItemRepository orderItems;
  private final CartRepository carts;
  private final CartItemRepository cartItems;
  private final ProductRepository products;
  private final PromoCodeRepository promoCodes;
  private final UserRepository users;

  public OrdersService(
      OrderRepository orders,
      OrderItemRepository orderItems,
      CartRepository carts,
      CartItemRepository cartItems,
      ProductRepository products,
      PromoCodeRepository promoCodes,
      UserRepository users
  ) {
    this.orders = orders;
    this.orderItems = orderItems;
    this.carts = carts;
    this.cartItems = cartItems;
    this.products = products;
    this.promoCodes = promoCodes;
    this.users = users;
  }

  @Transactional
  public OrderDto createFromCart(Long userId, CreateOrderRequest req) {
    CartEntity cart = carts.findByUserId(userId)
        .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Cart is empty"));

    List<CartItemEntity> cartItemList = cartItems.findByCartId(cart.getId());
    if (cartItemList.isEmpty()) {
      throw new ResponseStatusException(BAD_REQUEST, "Cart is empty");
    }

    BigDecimal subtotal = BigDecimal.ZERO;
    Instant now = Instant.now();

    OrderEntity order = new OrderEntity();
    order.setUserId(userId);
    order.setStatus(OrderStatus.NEW);
    order.setShippingAddress(req.shippingAddress().trim());
    order.setCreatedAt(now);
    order.setUpdatedAt(now);
    order.setSubtotal(BigDecimal.ZERO);
    order.setDiscount(BigDecimal.ZERO);
    order.setTotal(BigDecimal.ZERO);

    order = orders.save(order);

    for (CartItemEntity cartItem : cartItemList) {
      ProductEntity product = products.findByIdAndIsActiveTrue(cartItem.getProductId())
          .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Product not found: " + cartItem.getProductId()));

      int qty = cartItem.getQuantity() == null ? 0 : cartItem.getQuantity();
      if (qty <= 0) {
        throw new ResponseStatusException(BAD_REQUEST, "Invalid cart item quantity");
      }

      int stock = product.getStockQuantity() == null ? 0 : product.getStockQuantity();
      if (stock < qty) {
        throw new ResponseStatusException(BAD_REQUEST, "Not enough stock for product: " + product.getTitle());
      }

      BigDecimal unitPrice = safeMoney(product.getPrice());
      BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(qty)).setScale(2, RoundingMode.HALF_UP);

      OrderItemEntity item = new OrderItemEntity();
      item.setOrderId(order.getId());
      item.setProductId(product.getId());
      item.setProductTitleSnapshot(product.getTitle());
      item.setUnitPriceSnapshot(unitPrice);
      item.setQuantity(qty);
      item.setLineTotal(lineTotal);
      orderItems.save(item);

      subtotal = subtotal.add(lineTotal);

      product.setStockQuantity(stock - qty);
      product.setUpdatedAt(now);
      products.save(product);
    }

    BigDecimal discountPercent = resolveDiscountPercent(req.promoCode());
    BigDecimal discountAmount = subtotal
        .multiply(discountPercent)
        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

    BigDecimal total = subtotal.subtract(discountAmount).setScale(2, RoundingMode.HALF_UP);

    order.setSubtotal(subtotal.setScale(2, RoundingMode.HALF_UP));
    order.setDiscount(discountAmount);
    order.setTotal(total);
    order.setUpdatedAt(now);
    order = orders.save(order);

    cartItems.deleteByCartId(cart.getId());
    cart.setUpdatedAt(now);
    carts.save(cart);

    return toDto(order, orderItems.findByOrderId(order.getId()));
  }

  public OrderDto getUserOrder(Long userId, Long orderId) {
    OrderEntity order = orders.findByIdAndUserId(orderId, userId)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Order not found"));

    return toDto(order, orderItems.findByOrderId(order.getId()));
  }

  public OrderDto getAdminOrder(Long orderId) {
    OrderEntity order = orders.findById(orderId)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Order not found"));

    return toDto(order, orderItems.findByOrderId(order.getId()));
  }

  @Transactional
  public OrderDto updateStatus(Long orderId, OrderStatus newStatus) {
    OrderEntity order = orders.findById(orderId)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Order not found"));

    order.setStatus(newStatus);
    order.setUpdatedAt(Instant.now());
    order = orders.save(order);

    return toDto(order, orderItems.findByOrderId(order.getId()));
  }

 public OrderDto toDto(OrderEntity o, List<OrderItemEntity> items) {
  var dtoItems = items.stream()
      .map(i -> new OrderDto.Item(
          i.getProductId() == null ? "" : String.valueOf(i.getProductId()),
          i.getProductTitleSnapshot(),
          i.getUnitPriceSnapshot().doubleValue(),
          i.getQuantity()
      ))
      .toList();

  double subtotal = o.getSubtotal() == null ? 0 : o.getSubtotal().doubleValue();
  double discountPercent = 0;

  if (o.getSubtotal() != null && o.getSubtotal().compareTo(BigDecimal.ZERO) > 0 && o.getDiscount() != null) {
    discountPercent = o.getDiscount()
        .multiply(BigDecimal.valueOf(100))
        .divide(o.getSubtotal(), 2, RoundingMode.HALF_UP)
        .doubleValue();
  }

  UserEntity user = users.findById(o.getUserId()).orElse(null);
  String email = user == null || user.getEmail() == null ? "" : user.getEmail();

String status = o.getStatus() == null ? "NEW" : o.getStatus().name();

return new OrderDto(
    String.valueOf(o.getId()),
    o.getCreatedAt() == null ? "" : o.getCreatedAt().toString(),
    status,
    new OrderDto.Customer("", email, o.getShippingAddress() == null ? "" : o.getShippingAddress()),
    dtoItems,
    subtotal,
    discountPercent,
    o.getTotal() == null ? 0 : o.getTotal().doubleValue()
);
}

  private BigDecimal resolveDiscountPercent(String rawCode) {
    if (rawCode == null || rawCode.isBlank()) {
      return BigDecimal.ZERO;
    }

    String code = rawCode.trim();

    PromoCodeEntity promo = promoCodes.findByCodeIgnoreCase(code)
        .filter(p -> Boolean.TRUE.equals(p.getIsActive()))
        .filter(p -> p.getExpiresAt() == null || p.getExpiresAt().isAfter(Instant.now()))
        .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Invalid promo code"));

    return safeMoney(promo.getDiscountPercent());
  }

  private BigDecimal safeMoney(BigDecimal value) {
    return (value == null ? BigDecimal.ZERO : value).setScale(2, RoundingMode.HALF_UP);
  }
}