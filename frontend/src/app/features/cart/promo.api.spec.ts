import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { PromoApi } from './promo.api';

describe('PromoApi', () => {
  let api: PromoApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PromoApi, provideHttpClient(), provideHttpClientTesting()],
    });

    api = TestBed.inject(PromoApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('returns null for empty promo code without request', () => {
    let response: number | null | undefined;

    api.getDiscount('  ').subscribe((res) => {
      response = res;
    });

    http.expectNone((r) => r.url.includes('/promoCodes'));
    expect(response).toBeNull();
  });

  it('loads normalized promo code discount', () => {
    let response: number | null | undefined;

    api.getDiscount(' save10 ').subscribe((res) => {
      response = res;
    });

    const req = http.expectOne((r) => r.url.includes('/promoCodes'));

    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('code')).toBe('SAVE10');

    req.flush({ code: 'SAVE10', discountPercent: 10 });

    expect(response).toBe(10);
  });

  it('returns zero for non-positive discounts', () => {
    let response: number | null | undefined;

    api.getDiscount('SAVE0').subscribe((res) => {
      response = res;
    });

    const req = http.expectOne((r) => r.url.includes('/promoCodes'));
    req.flush({ code: 'SAVE0', discountPercent: 0 });

    expect(response).toBe(0);
  });

  it('returns null on promo api failure', () => {
    let response: number | null | undefined;
    let errorSeen: HttpErrorResponse | undefined;

    api.getDiscount('BAD').subscribe({
      next: (res) => {
        response = res;
      },
      error: (err) => {
        errorSeen = err;
      },
    });

    const req = http.expectOne((r) => r.url.includes('/promoCodes'));
    req.flush({ message: 'Promo failed' }, { status: 500, statusText: 'Server Error' });

    expect(response).toBeNull();
    expect(errorSeen).toBeUndefined();
  });
});
