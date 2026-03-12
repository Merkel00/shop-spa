import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrdersApi } from '../../core/orders/orders.api';
import { map, shareReplay } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wrap">
      <div class="top">
        <h1>Admin Dashboard</h1>
        <div class="actions">
          <a routerLink="/">Catalog</a>
          <a routerLink="/admin/orders">Orders</a>
          <a routerLink="/admin/products">Manage products</a>
        </div>
      </div>

      <ng-container *ngIf="vm$ | async as vm">

        <!-- KPI Cards -->
        <div class="cards">
          <div class="card">
            <div class="label">Total orders</div>
            <div class="value">{{ vm.count }}</div>
          </div>

          <div class="card">
            <div class="label">Revenue</div>
            <div class="value">\${{ vm.revenue }}</div>
          </div>

          <div class="card">
            <div class="label">Avg order value</div>
            <div class="value">\${{ vm.avg }}</div>
          </div>

          <div class="card">
            <div class="label">Top product</div>
            <div class="value small">
              {{ vm.topProduct.title || '—' }}
            </div>
          </div>

          <div class="card">
            <div class="label">Top customer</div>
            <div class="value small">
              {{ vm.topCustomer?.email || '—' }}
            </div>
          </div>
        </div>

        <!-- Latest Orders -->
        <h2 class="h2">Latest orders</h2>

        <table class="t" *ngIf="vm.latest.length; else empty">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Email</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let x of vm.latest">
              <td>{{ x.id }}</td>
              <td>{{ x.createdAt ? (x.createdAt | date:'short') : '—' }}</td>
              <td>{{ x.customer.email }}</td>
              <td>\${{ x.total }}</td>
            </tr>
          </tbody>
        </table>

        <ng-template #empty>
          <div class="empty">
            No orders yet
          </div>
        </ng-template>

      </ng-container>
    </div>
  `,
  styles: [`
    .wrap { padding: 24px; max-width: 1200px; margin: 0 auto; }

    .top {
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap: 16px;
      margin-bottom: 16px;
    }

    .actions { display:flex; gap: 12px; }

    .cards {
      display:grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 14px;
      margin: 20px 0 26px;
    }

    .card {
      border: 1px solid var(--border);
      background: var(--card);
      border-radius: 16px;
      padding: 14px;
      box-shadow: var(--shadow);
    }

    .label {
      color: var(--muted);
      font-size: 12px;
    }

    .value {
      font-size: 22px;
      font-weight: 800;
      margin-top: 6px;
    }

    .value.small {
      font-size: 16px;
      font-weight: 600;
    }

    .h2 { margin: 16px 0 12px; }

    .t {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid var(--border);
      background: var(--card);
      border-radius: 14px;
      overflow: hidden;
    }

    .t th, .t td {
      padding: 10px 12px;
      border-bottom: 1px solid var(--border);
      text-align: left;
    }

    .t th {
      font-size: 12px;
      color: var(--muted);
      font-weight: 600;
    }

    .t tr:hover {
      background: color-mix(in srgb, var(--primary) 8%, transparent);
    }

    .empty {
      padding: 20px;
      border-radius: 14px;
      border: 1px solid var(--border);
      background: var(--card);
      color: var(--muted);
      text-align:center;
    }
  `]
})
export class AdminDashboardPage {
  private api = inject(OrdersApi);

  orders$ = this.api.getAllAdmin()
    .pipe(shareReplay({ bufferSize: 1, refCount: true }));

  vm$ = this.orders$.pipe(
    map(list => {
      const count = list.length;

      const revenue =
        Math.round(
          list.reduce((s, x) => s + Number(x.total || 0), 0) * 100
        ) / 100;

      const avg = count ? Math.round((revenue / count) * 100) / 100 : 0;


      const productMap = new Map<string, { title: string; qty: number }>();

      list.forEach(o => {
        o.items.forEach(i => {
          const prev = productMap.get(i.productId);
          if (prev) {
            prev.qty += i.qty;
          } else {
            productMap.set(i.productId, { title: i.title, qty: i.qty });
          }
        });
      });

      const topProduct = Array.from(productMap.values())
        .sort((a, b) => b.qty - a.qty)[0];


      const customerMap = new Map<string, number>();

      list.forEach(o => {
        const email = o.customer.email;
        customerMap.set(email, (customerMap.get(email) || 0) + o.total);
      });

      const topCustomerEmail = Array.from(customerMap.entries())
        .sort((a, b) => b[1] - a[1])[0]?.[0];

      const topCustomer = topCustomerEmail
        ? { email: topCustomerEmail }
        : null;

      const latest = list.slice().reverse().slice(0, 5);

      return {
        count,
        revenue,
        avg,
        topProduct,
        topCustomer,
        latest
      };
    })
  );
}
