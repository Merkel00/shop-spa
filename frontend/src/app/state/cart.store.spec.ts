import { TestBed } from '@angular/core/testing';
import { firstValueFrom, BehaviorSubject, of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { CartStore } from './cart.store';
import { AuthService } from '../core/auth/auth.service';
import type { SessionUser } from '../core/auth/auth.api';
import type { Product } from '../shared/models/product';
import { CartApi } from '../core/cart/cart.api';
import { ToastService } from '../core/ui/toast.service';

type CartItemLike = {
  id: number;
  product: Product;
  qty: number;
};

type CartResponseLike = {
  items: CartItemLike[];
};

class AuthStub {
  private sub = new BehaviorSubject<SessionUser | null>(null);

  user$ = this.sub.asObservable();
  user = () => this.sub.value;

  set(u: SessionUser | null) {
    this.sub.next(u);
  }
}

function p(id: string, price: number): Product {
  return {
    id,
    title: `P${id}`,
    price,
    category: 'other',
    description: '',
    image: '',
    stock: 10,
  };
}

function cart(items: CartItemLike[]): CartResponseLike {
  return { items };
}

describe('CartStore', () => {
  let store: CartStore;
  let auth: AuthStub;

  let api: {
    getCart: ReturnType<typeof vi.fn>;
    addItem: ReturnType<typeof vi.fn>;
    updateItem: ReturnType<typeof vi.fn>;
    removeItem: ReturnType<typeof vi.fn>;
    clear: ReturnType<typeof vi.fn>;
  };

  let toast: {
    success: ReturnType<typeof vi.fn>;
    info: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    api = {
      getCart: vi.fn().mockReturnValue(of(cart([]))),
      addItem: vi.fn(),
      updateItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };

    toast = {
      success: vi.fn(),
      info: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        CartStore,
        { provide: AuthService, useClass: AuthStub },
        { provide: CartApi, useValue: api },
        { provide: ToastService, useValue: toast },
      ],
    });

    auth = TestBed.inject(AuthService) as any;
    store = TestBed.inject(CartStore);
  });

  it('starts empty for guest', () => {
    expect(store.snapshot()).toEqual([]);
  });

  it('keeps cart empty when api returns empty cart', () => {
    auth.set({
      id: 'u1',
      email: 'user@test.com',
      role: 'USER',
    });

    expect(api.getCart).toHaveBeenCalledTimes(1);
    expect(store.snapshot()).toEqual([]);
  });

  it('reloads cart after login', () => {
    const a = p('1', 100);

    api.getCart.mockReturnValue(
      of(cart([{ id: 11, product: a, qty: 2 }]))
    );

    auth.set({
      id: 'u1',
      email: 'user@test.com',
      role: 'USER',
    });

    expect(api.getCart).toHaveBeenCalledTimes(1);
    expect(store.snapshot()).toEqual([{ id: 11, product: a, qty: 2 }]);
  });

  it('add sends request and updates snapshot', () => {
    const a = p('1', 100);

    auth.set({
      id: 'u1',
      email: 'user@test.com',
      role: 'USER',
    });

    api.addItem.mockReturnValue(
      of(cart([{ id: 21, product: a, qty: 2 }]))
    );

    store.add(a);

    expect(api.addItem).toHaveBeenCalledWith('1', 1);
    expect(store.snapshot()).toEqual([{ id: 21, product: a, qty: 2 }]);
    expect(toast.success).toHaveBeenCalledWith('Added to cart');
  });

  it('inc increases qty', () => {
    const a = p('1', 100);

    auth.set({
      id: 'u1',
      email: 'user@test.com',
      role: 'USER',
    });

    api.getCart.mockReturnValue(
      of(cart([{ id: 31, product: a, qty: 1 }]))
    );
    store.reload();

    api.updateItem.mockReturnValue(
      of(cart([{ id: 31, product: a, qty: 2 }]))
    );

    store.inc(31);

    expect(api.updateItem).toHaveBeenCalledWith(31, 2);
    expect(store.snapshot()[0].qty).toBe(2);
  });

  it('dec decreases qty and removes when reaches 0', () => {
    const a = p('1', 100);

    auth.set({
      id: 'u1',
      email: 'user@test.com',
      role: 'USER',
    });

    api.getCart.mockReturnValue(
      of(cart([{ id: 41, product: a, qty: 1 }]))
    );
    store.reload();

    api.updateItem.mockReturnValue(of(cart([])));

    store.dec(41);

    expect(api.updateItem).toHaveBeenCalledWith(41, 0);
    expect(store.snapshot()).toEqual([]);
  });

  it('remove deletes item', () => {
    const a = p('1', 100);
    const b = p('2', 50);

    auth.set({
      id: 'u1',
      email: 'user@test.com',
      role: 'USER',
    });

    api.getCart.mockReturnValue(
      of(
        cart([
          { id: 51, product: a, qty: 1 },
          { id: 52, product: b, qty: 1 },
        ])
      )
    );
    store.reload();

    api.removeItem.mockReturnValue(
      of(cart([{ id: 52, product: b, qty: 1 }]))
    );

    store.remove(51);

    expect(api.removeItem).toHaveBeenCalledWith(51);
    expect(store.snapshot().map(x => x.product.id)).toEqual(['2']);
    expect(toast.info).toHaveBeenCalledWith('Item removed');
  });

  it('clear empties cart', () => {
    const a = p('1', 100);

    auth.set({
      id: 'u1',
      email: 'user@test.com',
      role: 'USER',
    });

    api.getCart.mockReturnValue(
      of(cart([{ id: 61, product: a, qty: 2 }]))
    );
    store.reload();

    api.clear.mockReturnValue(of(cart([])));

    store.clear();

    expect(api.clear).toHaveBeenCalledTimes(1);
    expect(store.snapshot()).toEqual([]);
    expect(toast.info).toHaveBeenCalledWith('Cart cleared');
  });

  it('total$ and count$ compute correctly', async () => {
    const a = p('1', 100);
    const b = p('2', 50);

    auth.set({
      id: 'u1',
      email: 'user@test.com',
      role: 'USER',
    });

    api.getCart.mockReturnValue(
      of(
        cart([
          { id: 71, product: a, qty: 1 },
          { id: 72, product: b, qty: 2 },
        ])
      )
    );

    store.reload();

    const total = await firstValueFrom(store.total$);
    const count = await firstValueFrom(store.count$);

    expect(total).toBe(200);
    expect(count).toBe(3);
  });

  it('replaces items when active user changes', () => {
    const a = p('1', 100);
    const b = p('2', 50);

    api.getCart
      .mockReturnValueOnce(of(cart([{ id: 81, product: a, qty: 1 }])))
      .mockReturnValueOnce(of(cart([{ id: 82, product: b, qty: 3 }])));

    auth.set({
      id: 'u1',
      email: 'first@test.com',
      role: 'USER',
    });

    expect(store.snapshot()).toEqual([{ id: 81, product: a, qty: 1 }]);

    auth.set({
      id: 'u2',
      email: 'second@test.com',
      role: 'USER',
    });

    expect(api.getCart).toHaveBeenCalledTimes(2);
    expect(store.snapshot()).toEqual([{ id: 82, product: b, qty: 3 }]);
  });

  it('add does nothing for guest', () => {
    const a = p('1', 100);

    store.add(a);

    expect(api.addItem).not.toHaveBeenCalled();
    expect(store.snapshot()).toEqual([]);
  });
});
