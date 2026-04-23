# M6 - Cart Empty-State Mutant

## Module

Frontend checkout / empty-cart validation

## Changed File Path

`frontend/src/app/features/cart/checkout.page.ts`

## Mutation Type

Weakened precondition check

## Rationale

This mutant weakens the checkout precondition that blocks empty-cart submissions. It makes the guard effectively impossible to trigger, allowing checkout to continue even when the cart has no items.

## Original Behavior

Checkout stopped when the cart snapshot was empty, showed a `Cart is empty` info toast, and did not call the order API.

## Mutated Behavior

The empty-cart guard no longer triggers for an empty cart, so checkout can continue toward order creation even with zero items.

## Original Code Snippet

```ts
const items = this.cart.snapshot();
if (items.length === 0) {
  this.toast.info('Cart is empty');
  return;
}
```

## Mutated Code Snippet

```ts
const items = this.cart.snapshot();
if (items.length < 0) {
  this.toast.info('Cart is empty');
  return;
}
```

## Likely Detecting Tests

- `frontend/src/app/features/cart/checkout.page.spec.ts`
  - `does not allow checkout when cart is empty`

## Note

This is a temporary manual mutation for Assignment 3.
