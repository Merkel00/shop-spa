import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { combineLatest, firstValueFrom, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, startWith, switchMap } from 'rxjs/operators';
import { CartStore } from '../../state/cart.store';
import { PromoApi } from './promo.api';
import { OrdersApi } from '../../core/orders/orders.api';
import { ToastService } from '../../core/ui/toast.service';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './checkout.page.html',
  styleUrl: './checkout.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckoutPage {
  cart = inject(CartStore);
  promoApi = inject(PromoApi);
  fb = inject(FormBuilder);
  orders = inject(OrdersApi);
  router = inject(Router);
  toast = inject(ToastService);

  promoDiscount: number | null = null;
  submitting = false;

  f = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    address: ['', [Validators.required, Validators.minLength(5)]],
    promo: ['']
  });

  subtotal$ = this.cart.total$;

  discount$ = this.f.controls.promo.valueChanges.pipe(
    startWith(this.f.controls.promo.value),
    map(() => this.promoDiscount ?? 0)
  );

  finalTotal$ = combineLatest([this.subtotal$, this.discount$]).pipe(
    map(([sub, d]) => Math.round(sub * (1 - d / 100) * 100) / 100)
  );

  promoInvalid(): boolean {
    return this.f.controls.promo.hasError('promoInvalid');
  }

ngOnInit() {
  const promoCtrl = this.f.controls.promo;

  promoCtrl.valueChanges.pipe(
    map(v => String(v ?? '')),
    map(v => v.trim().toUpperCase()),
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(code => {
      if (!code) return of({ code, discount: null as number | null });

      return this.promoApi.getDiscount(code).pipe(
        map(d => ({ code, discount: d })),
        catchError(() => of({ code, discount: null }))
      );
    })
  ).subscribe(({ code, discount }) => {
    const current = String(promoCtrl.value ?? '').trim().toUpperCase();
    if (current !== code) return;

    this.promoDiscount = discount;

    if (!current) {
      promoCtrl.setErrors(null);
      this.promoDiscount = null;
      return;
    }

    promoCtrl.setErrors(discount == null ? { promoInvalid: true } : null);
  });
}

async submit() {
  if (this.submitting) return;

  if (this.f.invalid) {
    this.f.markAllAsTouched();
    return;
  }

  const items = this.cart.snapshot();
  if (items.length === 0) {
  this.toast.info('Cart is empty');
  return;
}
  this.submitting = true;

  try {
    const v = this.f.getRawValue();

    const saved = await firstValueFrom(
      this.orders.create({
        shippingAddress: String(v.address ?? '').trim(),
        promoCode: String(v.promo ?? '').trim() || null
      })
    );

    this.cart.clear();
    this.cart.clear();
    this.toast.success('Order created successfully');
    await this.router.navigate(['/order-success', saved.id]);
  } catch (e: any) {
    const msg =
    e?.error?.message ||
    e?.error?.error ||
    'Order save failed';
    this.toast.error(msg);
  } finally {
    this.submitting = false;
  }
}
}