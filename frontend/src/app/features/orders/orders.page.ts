import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { OrdersApi } from '../../core/orders/orders.api';
import { AuthService } from '../../core/auth/auth.service';
import { Order } from '../../shared/models/order';

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './orders.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrdersPage {
  private ordersApi = inject(OrdersApi);
  private auth = inject(AuthService);

  private reloadSub = new BehaviorSubject<number>(0);
  reload() {
    this.reloadSub.next(this.reloadSub.value + 1);
  }

vm$ = combineLatest([this.auth.user$, this.reloadSub.asObservable()]).pipe(
  switchMap(([u]) => {
    if (!u) return of({ items: [] as Order[], email: '', error: 'Not logged in' });

    const myEmail = (u.email ?? '').trim().toLowerCase();

    return this.ordersApi.getAll().pipe(
      map((all) => {
        const items = (all ?? [])
          .slice()
          .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

        return { items, email: myEmail, error: '' };
      }),
      catchError((e) => of({ items: [] as Order[], email: myEmail, error: String(e?.message ?? e) }))
    );
  })
);

  track = (_: number, x: Order) => x.id ?? String(_);

  formatDate(v: string) {
    if (!v) return '—';
    const d = new Date(v);
    return isNaN(d.getTime()) ? '—' : d.toLocaleString();
  }
}
