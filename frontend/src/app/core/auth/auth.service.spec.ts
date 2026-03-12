import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AuthApi } from './auth.api';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let svc: AuthService;
  let api: { findUserByEmail: any };

  beforeEach(() => {
    localStorage.clear();

    api = {
      findUserByEmail: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: AuthApi, useValue: api },
      ],
    });

    svc = TestBed.inject(AuthService);
  });

  it('login success sets session and updates user()', () => {
    api.findUserByEmail.mockReturnValue(
      of([{ id: 7, email: 'admin@shop.com', password: '123', role: 'admin' }])
    );

    let res: any;
    svc.login('  ADMIN@shop.com ', '123').subscribe((x) => (res = x));

    expect(res).toEqual({ id: '7', email: 'admin@shop.com', role: 'admin' });
    expect(svc.user()).toEqual({ id: '7', email: 'admin@shop.com', role: 'admin' });

    const raw = localStorage.getItem('shop_session');
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!)).toEqual({ id: '7', email: 'admin@shop.com', role: 'admin' });
  });

  it('login fails when user not found', () => {
    api.findUserByEmail.mockReturnValue(of([]));

    let err: any;
    svc.login('x@x.com', '1').subscribe({
      next: () => {},
      error: (e) => (err = e),
    });

    expect(err).toBeTruthy();
    expect(String(err.message || err)).toContain('Invalid credentials');
    expect(svc.user()).toBeNull();
  });

  it('login fails when password mismatch', () => {
    api.findUserByEmail.mockReturnValue(
      of([{ id: 1, email: 'u@a.com', password: 'right', role: 'user' }])
    );

    let err: any;
    svc.login('u@a.com', 'wrong').subscribe({
      next: () => {},
      error: (e) => (err = e),
    });

    expect(err).toBeTruthy();
    expect(svc.user()).toBeNull();
  });

  it('logout clears session', () => {
    svc.setSession({ id: '1', email: 'u@a.com', role: 'user' });
    expect(svc.user()).toBeTruthy();

    svc.logout();

    expect(svc.user()).toBeNull();
    expect(localStorage.getItem('shop_session')).toBeNull();
  });

  it('reads session from localStorage on init', () => {
    localStorage.setItem(
      'shop_session',
      JSON.stringify({ id: '9', email: 'a@b.com', role: 'user' })
    );

    const svc2 = new AuthService(api as any);

    expect(svc2.user()).toEqual({ id: '9', email: 'a@b.com', role: 'user' });
  });
});
