import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { BehaviorSubject, firstValueFrom, isObservable } from 'rxjs';
import { describe, it, expect, beforeEach } from 'vitest';

import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';
import type { SessionUser } from './auth.api';

class AuthStub {
  private sub = new BehaviorSubject<SessionUser | null>(null);

  user$ = this.sub.asObservable();

  set(user: SessionUser | null) {
    this.sub.next(user);
  }
}

async function resolveGuardResult(result: any) {
  if (isObservable(result)) return firstValueFrom(result);
  return await Promise.resolve(result);
}

describe('authGuard', () => {
  let auth: AuthStub;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useClass: AuthStub }],
    });

    auth = TestBed.inject(AuthService) as unknown as AuthStub;
    router = TestBed.inject(Router);
  });

  it('allows authenticated user', async () => {
    auth.set({
      id: 'u1',
      email: 'user@test.com',
      role: 'USER',
    });

    const result = await TestBed.runInInjectionContext(() =>
      resolveGuardResult(authGuard({} as any, [{ path: 'orders' }] as any))
    );

    expect(result).toBe(true);
  });

  it('blocks guest and redirects to login with returnUrl', async () => {
    const result = await TestBed.runInInjectionContext(() =>
      resolveGuardResult(authGuard({} as any, [{ path: 'orders' }] as any))
    );

    expect(router.serializeUrl(result as any)).toBe('/login?returnUrl=%2Forders');
  });

  it('blocks guest from checkout and preserves nested returnUrl', async () => {
    const result = await TestBed.runInInjectionContext(() =>
      resolveGuardResult(authGuard({} as any, [{ path: 'cart' }, { path: 'checkout' }] as any))
    );

    expect(router.serializeUrl(result as any)).toBe('/login?returnUrl=%2Fcart%2Fcheckout');
  });
});
