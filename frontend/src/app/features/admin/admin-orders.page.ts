import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { combineLatest, Subject } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
import { OrdersApi } from '../../core/orders/orders.api';
import { AuthService } from '../../core/auth/auth.service';
import { Order, OrderStatus } from '../../shared/models/order';

@Component({
  selector: 'app-admin-orders-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-orders.page.html',
  styleUrl: './admin-orders.page.scss',
 
})
export class AdminOrdersPage {
  api = inject(OrdersApi);
  auth = inject(AuthService);

  private reload$ = new Subject<void>();
  private search$ = new Subject<string>();
  private status$ = new Subject<string>();

  searchTerm = '';
  selectedStatus = '';

  readonly statuses: OrderStatus[] = [
    'NEW',
    'PAID',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED'
  ];

  private allOrders$ = this.reload$.pipe(
    startWith(void 0),
    switchMap(() => this.api.getAllAdmin())
  );

  private searchValue$ = this.search$.pipe(startWith(''));
  private statusValue$ = this.status$.pipe(startWith(''));

  orders$ = combineLatest([
    this.allOrders$,
    this.searchValue$,
    this.statusValue$
  ]).pipe(
    map(([orders, search, status]) => this.filterOrders(orders, search, status))
  );

  reload() {
    this.reload$.next();
  }

  logout() {
    this.auth.logout();
  }

  onSearch(value: string) {
    this.searchTerm = value;
    this.search$.next(value);
  }

  onStatusChange(value: string) {
    this.selectedStatus = value;
    this.status$.next(value);
  }

  trackByOrderId = (_: number, order: Order) => order.id;

  private filterOrders(orders: Order[], rawSearch: string, rawStatus: string): Order[] {
    const search = (rawSearch ?? '').trim().toLowerCase();
    const status = (rawStatus ?? '').trim().toUpperCase();

    return orders.filter(order => {
      const matchesStatus = !status || (order.status ?? '').toUpperCase() === status;

      if (!matchesStatus) {
        return false;
      }

      if (!search) {
        return true;
      }

      const haystack = [
        order.id,
        order.status ?? '',
        order.customer?.email ?? '',
        order.customer?.address ?? '',
        ...(order.items ?? []).map(i => i.title)
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(search);
    });
  }
}