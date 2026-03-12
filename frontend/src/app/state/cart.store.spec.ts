import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { CartStore } from './cart.store';
import { AuthService, SessionUser } from '../core/auth/auth.service';
import type { Product } from '../shared/models/product';

class AuthStub {
  private _u: SessionUser | null = null;
  user$ = { subscribe: (fn: (u: SessionUser | null) => void) => { fn(this._u); return { unsubscribe() {} }; } } as any;
  user = () => this._u;
  set(u: SessionUser | null) {
    this._u = u;
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

describe('CartStore', () => {
  let store: CartStore;
  let auth: AuthStub;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        CartStore,
        { provide: AuthService, useClass: AuthStub },
      ],
    });

    auth = TestBed.inject(AuthService) as any;
    store = TestBed.inject(CartStore);
  });

  it('starts empty', () => {
    expect(store.snapshot()).toEqual([]);
  });

  it('add increments qty for same product', () => {
    const a = p('1', 100);
    store.add(a);
    store.add(a);

    expect(store.snapshot()).toEqual([{ product: a, qty: 2 }]);
  });

  it('inc increases qty', () => {
    const a = p('1', 100);
    store.add(a);
    store.inc('1');

    expect(store.snapshot()[0].qty).toBe(2);
  });

  it('dec decreases qty and removes when reaches 0', () => {
    const a = p('1', 100);
    store.add(a);
    store.dec('1');

    expect(store.snapshot()).toEqual([]);
  });

  it('remove deletes item', () => {
    const a = p('1', 100);
    const b = p('2', 50);
    store.add(a);
    store.add(b);

    store.remove('1');

    expect(store.snapshot().map(x => x.product.id)).toEqual(['2']);
  });

  it('clear empties cart', () => {
    store.add(p('1', 100));
    store.add(p('2', 50));

    store.clear();

    expect(store.snapshot()).toEqual([]);
  });

  it('total$ and count$ compute correctly', async () => {
    store.add(p('1', 100));
    store.add(p('2', 50));
    store.inc('2'); 

    const total = await firstValueFrom(store.total$);
    const count = await firstValueFrom(store.count$);

    expect(total).toBe(200);
    expect(count).toBe(3);
  });

  it('persists to localStorage under guest key by default', () => {
    store.add(p('1', 100));

    const raw = localStorage.getItem('shop_cart:user:guest');
    expect(raw).toBeTruthy();

    const arr = JSON.parse(raw!);
    expect(arr[0].product.id).toBe('1');
    expect(arr[0].qty).toBe(1);
  });
});
