# M7 - Cart User Isolation Mutant

## Module

Frontend cart store / user-session isolation

## Changed File Path

`frontend/src/app/state/cart.store.ts`

## Mutation Type

Weakened user-isolation behavior

## Rationale

This mutant weakens per-user cart isolation by removing the cart reset that happens when there is no authenticated user. That allows cart state from a previous user session to remain visible after logout until another reload replaces it.

## Original Behavior

When the authenticated user became `null`, the cart store immediately cleared its in-memory items and returned to an empty cart state.

## Mutated Behavior

When the authenticated user becomes `null`, the cart store no longer clears its in-memory items. The previous cart contents can remain visible for a guest session.

## Original Code Snippet

```ts
constructor() {
  this.auth.user$.subscribe((u) => {
    if (!u) {
      this.itemsSub.next([]);
      return;
    }
    this.reload();
  });
}
```

## Mutated Code Snippet

```ts
constructor() {
  this.auth.user$.subscribe((u) => {
    if (!u) {
      return;
    }
    this.reload();
  });
}
```

## Likely Detecting Tests

- `frontend/src/app/state/cart.store.integration.spec.ts`
  - `isolates cart by current user and clears it on logout`
- `frontend/src/app/state/cart.store.spec.ts`
  - any test relying on guest state staying empty after a session transition

## Note

This is a temporary manual mutation for Assignment 3.
