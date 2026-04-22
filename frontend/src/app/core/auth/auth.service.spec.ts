import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { AuthApi, AuthResponse } from './auth.api';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let svc: AuthService;
  let storage: Storage;
  let api: {
    login: ReturnType<typeof vi.fn>;
    register: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    const data = new Map<string, string>();
    storage = {
      getItem: vi.fn((key: string) => data.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => {
        data.set(key, value);
      }),
      removeItem: vi.fn((key: string) => {
        data.delete(key);
      }),
      clear: vi.fn(() => {
        data.clear();
      }),
      key: vi.fn((index: number) => Array.from(data.keys())[index] ?? null),
      get length() {
        return data.size;
      },
    };

    vi.stubGlobal('localStorage', storage);
    localStorage.clear();

    api = {
      login: vi.fn(),
      register: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: AuthApi, useValue: api },
      ],
    });

    svc = TestBed.inject(AuthService);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('login success sets session and updates user()', () => {
    const authResponse: AuthResponse = {
      token: 'fake-token',
      user: { id: '7', email: 'admin@shop.com', role: 'ADMIN' },
    };

    api.login.mockReturnValue(of(authResponse));

    let res: AuthResponse | undefined;
    svc.login('  ADMIN@shop.com ', '123').subscribe((x) => {
      res = x;
    });

    expect(api.login).toHaveBeenCalledWith('  ADMIN@shop.com ', '123');
    expect(res).toEqual(authResponse);
    expect(svc.user()).toEqual({
      id: '7',
      email: 'admin@shop.com',
      role: 'ADMIN',
    });

    const raw = localStorage.getItem('shop_session');
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!)).toEqual({
      token: 'fake-token',
      user: { id: '7', email: 'admin@shop.com', role: 'ADMIN' },
    });
  });

  it('login fails when api returns error', () => {
    api.login.mockReturnValue(
      throwError(() => new Error('Invalid credentials'))
    );

    let err: any;
    svc.login('x@x.com', '1').subscribe({
      next: () => {},
      error: (e) => {
        err = e;
      },
    });

    expect(err).toBeTruthy();
    expect(String(err.message || err)).toContain('Invalid credentials');
    expect(svc.user()).toBeNull();
  });

  it('logout clears session', () => {
    svc.setSession({
      token: 'abc123',
      user: { id: '1', email: 'u@a.com', role: 'USER' },
    });

    expect(svc.user()).toEqual({
      id: '1',
      email: 'u@a.com',
      role: 'USER',
    });

    svc.logout();

    expect(svc.user()).toBeNull();
    expect(localStorage.getItem('shop_session')).toBeNull();
  });

  it('reads session from localStorage on init', () => {
    localStorage.setItem(
      'shop_session',
      JSON.stringify({
        token: 'saved-token',
        user: { id: '9', email: 'a@b.com', role: 'USER' },
      })
    );

    const svc2 = TestBed.runInInjectionContext(() => new AuthService(api as unknown as AuthApi));

    expect(svc2.user()).toEqual({
      id: '9',
      email: 'a@b.com',
      role: 'USER',
    });
    expect(svc2.token()).toBe('saved-token');
  });

  it('persists session for a new service instance after login', () => {
    const authResponse: AuthResponse = {
      token: 'persisted-token',
      user: { id: '10', email: 'persisted@test.com', role: 'USER' },
    };

    api.login.mockReturnValue(of(authResponse));

    svc.login('persisted@test.com', '123456').subscribe();

    const svc2 = TestBed.runInInjectionContext(() => new AuthService(api as unknown as AuthApi));

    expect(svc2.user()).toEqual(authResponse.user);
    expect(svc2.token()).toBe('persisted-token');
  });

  it('setSession(null) clears storage and user', () => {
    svc.setSession({
      token: 'temp-token',
      user: { id: '3', email: 'tmp@test.com', role: 'USER' },
    });

    expect(svc.user()).not.toBeNull();

    svc.setSession(null);

    expect(svc.user()).toBeNull();
    expect(localStorage.getItem('shop_session')).toBeNull();
  });
});
