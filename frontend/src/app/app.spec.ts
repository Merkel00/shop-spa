import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideRouter, Router } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { AppComponent } from './app';
import { AuthService } from './core/auth/auth.service';
import { CartStore } from './state/cart.store';
import { ToastService } from './core/ui/toast.service';
import { LoadingService } from './core/http/loading.service';

describe('App', () => {
  const logout = vi.fn();
  const clear = vi.fn();
  let router: Router;
  let navigateByUrlSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    logout.mockClear();
    clear.mockClear();

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            isLoggedIn$: of(false),
            isAdmin$: of(false),
            logout,
          },
        },
        {
          provide: CartStore,
          useValue: {
            count$: of(0),
            clear,
          },
        },
        {
          provide: ToastService,
          useValue: {
            items$: of([]),
            dismiss: vi.fn(),
          },
        },
        {
          provide: LoadingService,
          useValue: {
            isLoading$: of(false),
          },
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    navigateByUrlSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render shell components', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('app-toast-host')).toBeTruthy();
    expect(el.querySelector('router-outlet')).toBeTruthy();
  });

  it('logout clears auth, clears cart, and navigates home', async () => {
    const fixture = TestBed.createComponent(AppComponent);

    await fixture.componentInstance.logout();

    expect(logout).toHaveBeenCalledTimes(1);
    expect(clear).toHaveBeenCalledTimes(1);
    expect(navigateByUrlSpy).toHaveBeenCalledWith('/');
  });
});
