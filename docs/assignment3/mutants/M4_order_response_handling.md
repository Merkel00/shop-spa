# M4 - Order Response Handling Mutant

## Module

Frontend order response normalization

## Changed File Path

`frontend/src/app/core/orders/orders.api.ts`

## Mutation Type

Return value modification

## Rationale

This mutant weakens order response handling by converting a missing order status into a success-like final state. It makes incomplete backend responses look safer and more complete than they really are.

## Original Behavior

When an order response had no `status` field, the frontend normalized it to `'NEW'`.

## Mutated Behavior

When an order response has no `status` field, the frontend now normalizes it to `'DELIVERED'`.

## Original Code Snippet

```ts
private normalize = (o: any): Order => ({
  ...o,
  createdAt: this.parseDate(o.createdAt),
  customer: o.customer ?? { name: '', email: '', address: '' },
  items: o.items ?? [],
  subtotal: Number(o.subtotal ?? 0),
  discountPercent: Number(o.discountPercent ?? 0),
  total: Number(o.total ?? 0),
  status: o.status ?? 'NEW',
});
```

## Mutated Code Snippet

```ts
private normalize = (o: any): Order => ({
  ...o,
  createdAt: this.parseDate(o.createdAt),
  customer: o.customer ?? { name: '', email: '', address: '' },
  items: o.items ?? [],
  subtotal: Number(o.subtotal ?? 0),
  discountPercent: Number(o.discountPercent ?? 0),
  total: Number(o.total ?? 0),
  status: o.status ?? 'DELIVERED',
});
```

## Likely Detecting Tests

- `frontend/src/app/core/orders/orders.api.spec.ts`
  - `creates order with request payload and normalizes response`
  - `normalizes order collections and invalid dates`

## Note

This is a temporary manual mutation for Assignment 3.
