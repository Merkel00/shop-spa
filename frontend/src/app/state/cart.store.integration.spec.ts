import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { CartStore } from './cart.store';
import { AuthService } from '../core/auth/auth.service';
import { AuthApi } from '../core/auth/auth.api';
import { CartApi } from '../core/cart/cart.api';
import { ToastService } from '../core/ui/toast.service';

describe('CartStore integration', () => {
  let store: CartStore;
  let auth: AuthService;
  let cartApi: {
    getCart: ReturnType<typeof vi.fn>;
    addItem: ReturnType<typeof vi.fn>;
    updateItem: ReturnType<typeof vi.fn>;
    removeItem: ReturnType<typeof vi.fn>;
    clear: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    const data = new Map<string, string>();
    const storage: Storage = {
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

    cartApi = {
      getCart: vi.fn().mockReturnValue(of({ items: [] })),
      addItem: vi.fn(),
      updateItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        CartStore,
        { provide: AuthApi, useValue: { login: vi.fn(), register: vi.fn() } },
        { provide: CartApi, useValue: cartApi },
        {
          provide: ToastService,
          useValue: { success: vi.fn(), info: vi.fn(), error: vi.fn() },
        },
      ],
    });

    auth = TestBed.inject(AuthService);
    store = TestBed.inject(CartStore);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('isolates cart by current user and clears it on logout', () => {
    cartApi.getCart
      .mockReturnValueOnce(
        of({
          items: [{ id: 1, qty: 1, product: { id: 'p1', title: 'A', price: 50, category: 'other', description: '', image: '', stock: 1 } }],
        })
      )
      .mockReturnValueOnce(
        of({
          items: [{ id: 2, qty: 2, product: { id: 'p2', title: 'B', price: 25, category: 'other', description: '', image: '', stock: 1 } }],
        })
      );

    auth.setSession({
      token: 't1',
      user: { id: 'u1', email: 'u1@test.com', role: 'USER' },
    });
    expect(store.snapshot().map((x) => x.id)).toEqual([1]);

    auth.setSession({
      token: 't2',
      user: { id: 'u2', email: 'u2@test.com', role: 'USER' },
    });
    expect(store.snapshot().map((x) => x.id)).toEqual([2]);

    auth.logout();

    expect(store.snapshot()).toEqual([]);
  });

  it('restores persisted session and reloads cart for a new store instance', () => {
    auth.setSession({
      token: 'persisted',
      user: { id: 'u3', email: 'u3@test.com', role: 'USER' },
    });

    cartApi.getCart.mockReturnValue(
      of({
        items: [{ id: 3, qty: 1, product: { id: 'p3', title: 'C', price: 99, category: 'other', description: '', image: '', stock: 1 } }],
      })
    );

    const auth2 = TestBed.runInInjectionContext(
      () => new AuthService(TestBed.inject(AuthApi))
    );

    const store2 = TestBed.runInInjectionContext(() => new CartStore());

    expect(auth2.user()?.email).toBe('u3@test.com');
    expect(store2.snapshot().map((x) => x.id)).toEqual([3]);
    expect(cartApi.getCart).toHaveBeenCalled();
  });
});
