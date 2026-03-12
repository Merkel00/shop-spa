package com.shop.backend.web.orders;


import com.shop.backend.domain.order.OrderItemRepository;
import com.shop.backend.domain.order.OrderRepository;
import com.shop.backend.domain.order.OrderStatus;
import com.shop.backend.domain.order.OrdersService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@RestController
@RequestMapping("/api/orders")
public class OrdersController {

  private final OrderRepository orders;
  private final OrderItemRepository items;
  private final OrdersService ordersService;

  public OrdersController(
      OrderRepository orders,
      OrderItemRepository items,
      OrdersService ordersService
  ) {
    this.orders = orders;
    this.items = items;
    this.ordersService = ordersService;
  }

  @GetMapping("/admin")
  public List<OrderDto> allOrders(Authentication auth) {
    requireAdmin(auth);

    return orders.findAllByOrderByCreatedAtDesc().stream()
        .map(o -> ordersService.toDto(o, items.findByOrderId(o.getId())))
        .toList();
  }

  @GetMapping
  public List<OrderDto> myOrders(Authentication auth) {
    Long userId = requireUserId(auth);

    return orders.findByUserIdOrderByCreatedAtDesc(userId).stream()
        .map(o -> ordersService.toDto(o, items.findByOrderId(o.getId())))
        .toList();
  }

  @GetMapping("/{id}")
  public OrderDto myOrderById(@PathVariable Long id, Authentication auth) {
    Long userId = requireUserId(auth);
    return ordersService.getUserOrder(userId, id);
  }

  @GetMapping("/admin/{id}")
  public OrderDto adminOrderById(@PathVariable Long id, Authentication auth) {
    requireAdmin(auth);
    return ordersService.getAdminOrder(id);
  }

  @PostMapping
  public OrderDto create(@Valid @RequestBody CreateOrderRequest req, Authentication auth) {
    Long userId = requireUserId(auth);
    return ordersService.createFromCart(userId, req);
  }

  @PatchMapping("/{id}/status")
  public OrderDto updateStatus(
      @PathVariable Long id,
      @Valid @RequestBody UpdateOrderStatusRequest req,
      Authentication auth
  ) {
    requireAdmin(auth);
    return ordersService.updateStatus(id, req.status());
  }

  private void requireAdmin(Authentication auth) {
    if (auth == null || auth.getAuthorities() == null ||
        auth.getAuthorities().stream().noneMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()))) {
      throw new ResponseStatusException(FORBIDDEN, "Forbidden");
    }
  }

  private Long requireUserId(Authentication auth) {
    if (auth == null || auth.getName() == null) {
      throw new ResponseStatusException(UNAUTHORIZED, "Unauthenticated");
    }
    return Long.parseLong(auth.getName());
  }

  public record UpdateOrderStatusRequest(@NotNull OrderStatus status) {}
}