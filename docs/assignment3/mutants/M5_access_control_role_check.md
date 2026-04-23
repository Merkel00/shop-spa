# M5 - Access Control Role Check Mutant

## Module

Frontend access control / admin route guard

## Changed File Path

`frontend/src/app/core/auth/admin.guard.ts`

## Mutation Type

Logical inversion

## Rationale

This mutant weakens frontend admin protection by inverting the role check. It makes the guard allow authenticated non-admin users into admin routes while turning the real admin path into the blocked branch.

## Original Behavior

Guests were redirected to login, non-admin authenticated users were redirected to `/not-authorized`, and only admin users were allowed through.

## Mutated Behavior

Guests are still redirected to login, but authenticated non-admin users are now allowed through while admin users are redirected to `/not-authorized`.

## Original Code Snippet

```ts
return auth.user$.pipe(
  take(1),
  map((u) => {
    if (!u) return router.createUrlTree(['/login'], { queryParams: { returnUrl } });
    if ((u.role ?? '').toUpperCase() !== 'ADMIN') {
      return router.createUrlTree(['/not-authorized']);
    }
    return true;
  })
);
```

## Mutated Code Snippet

```ts
return auth.user$.pipe(
  take(1),
  map((u) => {
    if (!u) return router.createUrlTree(['/login'], { queryParams: { returnUrl } });
    if ((u.role ?? '').toUpperCase() === 'ADMIN') {
      return router.createUrlTree(['/not-authorized']);
    }
    return true;
  })
);
```

## Likely Detecting Tests

- `frontend/src/app/core/auth/admin.guard.spec.ts`
  - `allows admin user`
  - `blocks non-admin user and redirects to not-authorized`

## Note

This is a temporary manual mutation for Assignment 3.
