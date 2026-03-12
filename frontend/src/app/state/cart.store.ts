import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { CartApi, CartItem, CartResponse } from '../core/cart/cart.api';
import { AuthService } from '../core/auth/auth.service';
import { Product } from '../shared/models/product';
import { ToastService } from '../core/ui/toast.service';

@Injectable({ providedIn: 'root' })
export class CartStore {
  private api = inject(CartApi);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  private itemsSub = new BehaviorSubject<CartItem[]>([]);
  items$ = this.itemsSub.asObservable();

  total$ = this.items$.pipe(
    map((a) => a.reduce((s, x) => s + (Number(x.product.price) || 0) * x.qty, 0))
  );

  count$ = this.items$.pipe(map((a) => a.reduce((s, x) => s + x.qty, 0)));

  constructor() {
    this.auth.user$.subscribe((u) => {
      if (!u) {
        this.itemsSub.next([]);
        return;
      }
      this.reload();
    });
  }

  snapshot(): CartItem[] {
    return this.itemsSub.value;
  }

  reload() {
    if (!this.auth.user()) {
      this.itemsSub.next([]);
      return;
    }

    this.api.getCart().subscribe({
      next: (cart) => this.apply(cart),
      error: () => this.itemsSub.next([])
    });
  }

  add(p: Product) {
    if (!this.auth.user()) return;

    this.api.addItem(p.id, 1).subscribe({
  next: (cart) => {
    this.apply(cart);
    this.toast.success('Added to cart');
  }
});
  }

  inc(itemId: number) {
    const item = this.itemsSub.value.find(x => x.id === itemId);
    if (!item) return;

    this.api.updateItem(itemId, item.qty + 1).subscribe({
  next: (cart) => this.apply(cart)
});
  }

  dec(itemId: number) {
    const item = this.itemsSub.value.find(x => x.id === itemId);
    if (!item) return;

   this.api.updateItem(itemId, item.qty - 1).subscribe({
  next: (cart) => this.apply(cart)
});
  }

  remove(itemId: number) {
    this.api.removeItem(itemId).subscribe({
  next: (cart) => {
    this.apply(cart);
    this.toast.info('Item removed');
  }
});
  }

  clear() {
   this.api.clear().subscribe({
  next: (cart) => {
    this.apply(cart);
    this.toast.info('Cart cleared');
  }
});
  }

  private apply(cart: CartResponse) {
    this.itemsSub.next(cart.items ?? []);
  }
}