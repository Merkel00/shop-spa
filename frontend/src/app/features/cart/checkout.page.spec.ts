import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { provideRouter, Router } from '@angular/router';

import { CheckoutPage } from './checkout.page';
import { CartStore } from '../../state/cart.store';
import { PromoApi } from './promo.api';
import { OrdersApi } from '../../core/orders/orders.api';
import { ToastService } from '../../core/ui/toast.service';
import type { Product } from '../../shared/models/product';

function product(id: string, price: number): Product {
  return {
    id,
    title: `P${id}`,
    price,
    category: 'other',
    description: '',
    image: '',
    stock: 5,
  };
}

describe('CheckoutPage', () => {
  let page: CheckoutPage;

  let cart: {
    total$: Observable<number>;
    snapshot: ReturnType<typeof vi.fn>;
    clear: ReturnType<typeof vi.fn>;
  };

  let promoApi: {
    getDiscount: ReturnType<typeof vi.fn>;
  };

  let orders: {
    create: ReturnType<typeof vi.fn>;
  };

  let toast: {
    success: ReturnType<typeof vi.fn>;
    info: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
  };

  let router: Router;
  let navigateSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();

    cart = {
      total$: of(200),
      snapshot: vi.fn(),
      clear: vi.fn(),
    };

    promoApi = {
      getDiscount: vi.fn().mockReturnValue(of(null)),
    };

    orders = {
      create: vi.fn(),
    };

    toast = {
      success: vi.fn(),
      info: vi.fn(),
      error: vi.fn(),
    };

    TestBed.configureTestingModule({
      imports: [CheckoutPage],
      providers: [
        provideRouter([]),
        { provide: CartStore, useValue: cart },
        { provide: PromoApi, useValue: promoApi },
        { provide: OrdersApi, useValue: orders },
        { provide: ToastService, useValue: toast },
      ],
    });

    router = TestBed.inject(Router);
    navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    page = TestBed.createComponent(CheckoutPage).componentInstance;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('validates promo code and exposes invalid state', async () => {
    promoApi.getDiscount.mockReturnValue(of(15));

    page.ngOnInit();
    page.f.controls.promo.setValue(' save15 ');
    vi.advanceTimersByTime(300);
    await Promise.resolve();

    expect(promoApi.getDiscount).toHaveBeenCalledWith('SAVE15');
    expect(page.promoDiscount).toBe(15);
    expect(page.promoInvalid()).toBe(false);
  });

  it('marks promo as invalid when promo api returns no discount', async () => {
    promoApi.getDiscount.mockReturnValue(of(null));

    page.ngOnInit();
    page.f.controls.promo.setValue(' bad ');
    vi.advanceTimersByTime(300);
    await Promise.resolve();

    expect(page.promoDiscount).toBeNull();
    expect(page.promoInvalid()).toBe(true);
  });

  it('does not allow checkout when cart is empty', async () => {
    cart.snapshot.mockReturnValue([]);
    page.f.setValue({
      name: 'John',
      email: 'john@test.com',
      address: 'Main street 1',
      promo: '',
    });

    await page.submit();

    expect(orders.create).not.toHaveBeenCalled();
    expect(toast.info).toHaveBeenCalledWith('Cart is empty');
    expect(page.submitting).toBe(false);
  });

  it('submits order with trimmed checkout payload and redirects on success', async () => {
    cart.snapshot.mockReturnValue([
      { id: 1, qty: 2, product: product('7', 100) },
    ]);
    orders.create.mockReturnValue(
      of({
        id: 'o-1',
        createdAt: '2026-04-10T12:00:00Z',
        customer: { name: 'John', email: 'john@test.com', address: 'Main street 1' },
        items: [],
        subtotal: 200,
        discountPercent: 10,
        total: 180,
        status: 'NEW',
      })
    );

    page.f.setValue({
      name: 'John',
      email: 'john@test.com',
      address: '  Main street 1  ',
      promo: ' SAVE10 ',
    });

    await page.submit();

    expect(orders.create).toHaveBeenCalledWith({
      shippingAddress: 'Main street 1',
      promoCode: 'SAVE10',
    });
    expect(cart.clear).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('Order created successfully');
    expect(navigateSpy).toHaveBeenCalledWith(['/order-success', 'o-1']);
    expect(page.submitting).toBe(false);
  });

  it('shows api error message when order creation fails', async () => {
    cart.snapshot.mockReturnValue([
      { id: 1, qty: 1, product: product('7', 100) },
    ]);
    orders.create.mockReturnValue(
      throwError(() => ({ error: { message: 'Order create failed' } }))
    );

    page.f.setValue({
      name: 'John',
      email: 'john@test.com',
      address: 'Main street 1',
      promo: '',
    });

    await page.submit();

    expect(toast.error).toHaveBeenCalledWith('Order create failed');
    expect(cart.clear).not.toHaveBeenCalled();
    expect(navigateSpy).not.toHaveBeenCalled();
    expect(page.submitting).toBe(false);
  });
});
