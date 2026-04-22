import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { OrdersApi } from './orders.api';

describe('OrdersApi', () => {
  let api: OrdersApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OrdersApi, provideHttpClient(), provideHttpClientTesting()],
    });

    api = TestBed.inject(OrdersApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('creates order with request payload and normalizes response', () => {
    let response: any;

    api.create({
      shippingAddress: ' Main street 1 ',
      promoCode: 'SAVE10',
    }).subscribe((res) => {
      response = res;
    });

    const req = http.expectOne((r) => r.url.includes('/orders'));

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      shippingAddress: ' Main street 1 ',
      promoCode: 'SAVE10',
    });

    req.flush({
      id: 'o1',
      createdAt: '2026-04-10T12:00:00Z',
      subtotal: '100',
      discountPercent: '10',
      total: '90',
    });

    expect(response).toMatchObject({
      id: 'o1',
      subtotal: 100,
      discountPercent: 10,
      total: 90,
      status: 'NEW',
      customer: { name: '', email: '', address: '' },
      items: [],
    });
    expect(response.createdAt).toBe('2026-04-10T12:00:00.000Z');
  });

  it('normalizes order collections and invalid dates', () => {
    let response: any;

    api.getAll().subscribe((res) => {
      response = res;
    });

    const req = http.expectOne((r) => r.url.includes('/orders'));

    expect(req.request.method).toBe('GET');

    req.flush([
      {
        id: 'o2',
        createdAt: 'not-a-date',
        subtotal: '15',
        discountPercent: null,
        total: '15',
        items: null,
        customer: null,
      },
    ]);

    expect(response).toEqual([
      {
        id: 'o2',
        createdAt: '',
        subtotal: 15,
        discountPercent: 0,
        total: 15,
        items: [],
        customer: { name: '', email: '', address: '' },
        status: 'NEW',
      },
    ]);
  });

  it('gets single order by id and normalizes date', () => {
    let response: any;

    api.getById('15').subscribe((res) => {
      response = res;
    });

    const req = http.expectOne((r) => r.url.includes('/orders/15'));

    expect(req.request.method).toBe('GET');

    req.flush({
      id: '15',
      createdAt: '2026-04-10T10:00:00Z',
      customer: { name: 'John', email: 'john@test.com', address: 'Main 1' },
      items: [],
      subtotal: '20',
      discountPercent: '0',
      total: '20',
      status: 'PAID',
    });

    expect(response).toMatchObject({
      id: '15',
      subtotal: 20,
      total: 20,
      status: 'PAID',
    });
    expect(response.createdAt).toBe('2026-04-10T10:00:00.000Z');
  });

  it('gets admin order collections', () => {
    let response: any;

    api.getAllAdmin().subscribe((res) => {
      response = res;
    });

    const req = http.expectOne((r) => r.url.includes('/orders/admin'));

    expect(req.request.method).toBe('GET');

    req.flush([
      {
        id: 'a1',
        createdAt: null,
        subtotal: '50',
        discountPercent: '5',
        total: '47.5',
      },
    ]);

    expect(response[0]).toMatchObject({
      id: 'a1',
      createdAt: '',
      subtotal: 50,
      discountPercent: 5,
      total: 47.5,
    });
  });

  it('gets admin order by id', () => {
    let response: any;

    api.getAdminById(42).subscribe((res) => {
      response = res;
    });

    const req = http.expectOne((r) => r.url.includes('/orders/admin/42'));

    expect(req.request.method).toBe('GET');

    req.flush({
      id: '42',
      createdAt: '2026-04-10T11:00:00Z',
      subtotal: 30,
      discountPercent: 0,
      total: 30,
    });

    expect(response.id).toBe('42');
    expect(response.createdAt).toBe('2026-04-10T11:00:00.000Z');
  });

  it('updates order status', () => {
    let response: any;

    api.updateStatus('99', 'SHIPPED').subscribe((res) => {
      response = res;
    });

    const req = http.expectOne((r) => r.url.includes('/orders/99/status'));

    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: 'SHIPPED' });

    req.flush({
      id: '99',
      createdAt: '2026-04-10T12:30:00Z',
      subtotal: 100,
      discountPercent: 0,
      total: 100,
      status: 'SHIPPED',
    });

    expect(response.status).toBe('SHIPPED');
  });

  it('surfaces create errors', () => {
    let error: HttpErrorResponse | undefined;

    api.create({ shippingAddress: 'Main 1', promoCode: null }).subscribe({
      next: () => {},
      error: (err) => {
        error = err;
      },
    });

    const req = http.expectOne((r) => r.url.includes('/orders'));
    req.flush({ message: 'Create failed' }, { status: 500, statusText: 'Server Error' });

    expect(error?.status).toBe(500);
    expect(error?.error).toEqual({ message: 'Create failed' });
  });
});
