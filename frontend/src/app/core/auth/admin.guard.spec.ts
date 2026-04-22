import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { BehaviorSubject, firstValueFrom, isObservable } from 'rxjs';
import { describe, it, expect, beforeEach } from 'vitest';

import { adminGuard } from './admin.guard';
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

describe('adminGuard', () => {
  let auth: AuthStub;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useClass: AuthStub }],
    });

    auth = TestBed.inject(AuthService) as unknown as AuthStub;
    router = TestBed.inject(Router);
  });

  it('allows admin user', async () => {
    auth.set({
      id: 'a1',
      email: 'admin@test.com',
      role: 'ADMIN',
    });

    const result = await TestBed.runInInjectionContext(() =>
      resolveGuardResult(adminGuard({} as any, [{ path: 'admin' }] as any))
    );

    expect(result).toBe(true);
  });

  it('blocks guest and redirects to login with returnUrl', async () => {
    const result = await TestBed.runInInjectionContext(() =>
      resolveGuardResult(adminGuard({} as any, [{ path: 'admin' }] as any))
    );

    expect(router.serializeUrl(result as any)).toBe('/login?returnUrl=%2Fadmin');
  });

  it('blocks non-admin user and redirects to not-authorized', async () => {
    auth.set({
      id: 'u1',
      email: 'user@test.com',
      role: 'USER',
    });

    const result = await TestBed.runInInjectionContext(() =>
      resolveGuardResult(adminGuard({} as any, [{ path: 'admin' }] as any))
    );

    expect(router.serializeUrl(result as any)).toBe('/not-authorized');
  });
});
