import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { CartApi, CartResponse } from './cart.api';

describe('CartApi', () => {
  let api: CartApi;
  let http: HttpTestingController;

  const cartResponse: CartResponse = {
    items: [],
    total: 0,
    count: 0,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CartApi, provideHttpClient(), provideHttpClientTesting()],
    });

    api = TestBed.inject(CartApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('gets cart successfully', () => {
    let response: CartResponse | undefined;

    api.getCart().subscribe((res) => {
      response = res;
    });

    const req = http.expectOne((r) => r.url.includes('/cart'));

    expect(req.request.method).toBe('GET');

    req.flush(cartResponse);

    expect(response).toEqual(cartResponse);
  });

  it('surfaces get cart errors', () => {
    let error: HttpErrorResponse | undefined;

    api.getCart().subscribe({
      next: () => {},
      error: (err) => {
        error = err;
      },
    });

    const req = http.expectOne((r) => r.url.includes('/cart'));
    req.flush({ message: 'Cart load failed' }, { status: 500, statusText: 'Server Error' });

    expect(error?.status).toBe(500);
    expect(error?.error).toEqual({ message: 'Cart load failed' });
  });

  it('adds item with numeric payload', () => {
    let response: CartResponse | undefined;

    api.addItem('7', 3).subscribe((res) => {
      response = res;
    });

    const req = http.expectOne((r) => r.url.includes('/cart/items'));

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ productId: 7, qty: 3 });

    req.flush(cartResponse);

    expect(response).toEqual(cartResponse);
  });

  it('surfaces add item errors', () => {
    let error: HttpErrorResponse | undefined;

    api.addItem(2).subscribe({
      next: () => {},
      error: (err) => {
        error = err;
      },
    });

    const req = http.expectOne((r) => r.url.includes('/cart/items'));
    req.flush({ error: 'Out of stock' }, { status: 400, statusText: 'Bad Request' });

    expect(error?.status).toBe(400);
    expect(error?.error).toEqual({ error: 'Out of stock' });
  });

  it('updates item quantity', () => {
    let response: CartResponse | undefined;

    api.updateItem(12, 4).subscribe((res) => {
      response = res;
    });

    const req = http.expectOne((r) => r.url.includes('/cart/items/12'));

    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ qty: 4 });

    req.flush(cartResponse);

    expect(response).toEqual(cartResponse);
  });

  it('removes item from cart', () => {
    let response: CartResponse | undefined;

    api.removeItem(12).subscribe((res) => {
      response = res;
    });

    const req = http.expectOne((r) => r.url.includes('/cart/items/12'));

    expect(req.request.method).toBe('DELETE');

    req.flush(cartResponse);

    expect(response).toEqual(cartResponse);
  });

  it('clears cart successfully', () => {
    let response: CartResponse | undefined;

    api.clear().subscribe((res) => {
      response = res;
    });

    const req = http.expectOne((r) => r.url.includes('/cart/clear'));

    expect(req.request.method).toBe('DELETE');

    req.flush(cartResponse);

    expect(response).toEqual(cartResponse);
  });
});
