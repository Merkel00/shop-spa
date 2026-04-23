# C3 - Backend Order Delay Hook

## Target Module

Backend order creation service

## Changed Backend File Path

`backend/src/main/java/com/shop/backend/domain/order/OrdersService.java`

## Delay Control Variables / Properties

- `CHAOS_ORDER_DELAY_ENABLED=false|true`
- `CHAOS_ORDER_DELAY_MS=2500`

## Default Behavior

When `CHAOS_ORDER_DELAY_ENABLED` is not enabled, the backend order-creation path behaves exactly as before with no artificial delay.

## Delayed Behavior

When `CHAOS_ORDER_DELAY_ENABLED=true`, the backend sleeps for `CHAOS_ORDER_DELAY_MS` milliseconds during the order-creation path before continuing normal order processing.

## Why This Is a Controlled Chaos Scenario for Assignment 3

This adds a small, explicit, and toggleable latency hook only to the checkout/order creation path. It allows a reproducible slow-backend scenario for frontend checkout testing without changing business rules, payloads, or normal default runtime behavior.
