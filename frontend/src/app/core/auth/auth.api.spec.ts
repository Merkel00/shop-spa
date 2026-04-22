import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AuthApi } from './auth.api';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('AuthApi', () => {
  let api: AuthApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthApi,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    api = TestBed.inject(AuthApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('calls correct endpoint on login', () => {
    let response: any;

    api.login('  TEST@TEST.COM  ', '123456').subscribe((res) => {
      response = res;
    });

    const req = http.expectOne((r) => r.url.includes('/auth/login'));

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: 'test@test.com',
      password: '123456',
    });

    req.flush({
      token: 'fake-token',
      user: { id: '7', email: 'test@test.com', role: 'USER' },
    });

    expect(response).toEqual({
      token: 'fake-token',
      user: { id: '7', email: 'test@test.com', role: 'USER' },
    });
  });

  it('calls correct endpoint on register', () => {
    let response: any;

    api.register('  NEW@TEST.COM ', 'secret', ' John ').subscribe((res) => {
      response = res;
    });

    const req = http.expectOne((r) => r.url.includes('/auth/register'));

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: 'new@test.com',
      password: 'secret',
      name: 'John',
    });

    req.flush({
      token: 'reg-token',
      user: { id: '9', email: 'new@test.com', role: 'USER' },
    });

    expect(response).toEqual({
      token: 'reg-token',
      user: { id: '9', email: 'new@test.com', role: 'USER' },
    });
  });

  it('queries users by normalized email', () => {
    let response: any;

    api.findUserByEmail('  NEW@TEST.COM ').subscribe((res) => {
      response = res;
    });

    const req = http.expectOne((r) => r.url.includes('/users'));

    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('email')).toBe('new@test.com');

    req.flush([{ id: '9', email: 'new@test.com' }]);

    expect(response).toEqual([{ id: '9', email: 'new@test.com' }]);
  });
});
