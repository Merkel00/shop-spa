import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { switchMap } from 'rxjs/operators';
import { OrdersApi } from '../../core/orders/orders.api';
import { ToastService } from '../../core/ui/toast.service';
import { Order, OrderStatus } from '../../shared/models/order';

@Component({
  selector: 'app-admin-order-details-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-order-details.page.html',
  styleUrl: './admin-order-details.page.scss',
  changeDetection: ChangeDetectionStrategy.Default
})
export class AdminOrderDetailsPage {
  private route = inject(ActivatedRoute);
  private ordersApi = inject(OrdersApi);
  private toast = inject(ToastService);

  order: Order | null = null;
  loading = true;
  saving = false;
  errorMessage = '';

  readonly statuses: OrderStatus[] = [
    'NEW',
    'PAID',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED'
  ];

  selectedStatus: OrderStatus = 'NEW';

  ngOnInit() {
    this.loading = true;
    this.errorMessage = '';

    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (!id) {
          throw new Error('Order id is missing');
        }
        return this.ordersApi.getAdminById(id);
      })
    ).subscribe({
      next: (order) => {
        this.order = order;
        this.selectedStatus = (order.status ?? 'NEW') as OrderStatus;
        this.loading = false;
      },
      error: (err) => {
        console.error('admin order load failed', err);
        this.order = null;
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Failed to load order';
        this.toast.error(this.errorMessage);
      }
    });
  }

  saveStatus() {
    if (!this.order || this.saving) return;
    if (this.selectedStatus === this.order.status) return;

    this.saving = true;

    this.ordersApi.updateStatus(this.order.id, this.selectedStatus).subscribe({
      next: (updated) => {
        this.order = updated;
        this.selectedStatus = (updated.status ?? 'NEW') as OrderStatus;
        this.saving = false;
        this.toast.success('Order status updated');
      },
      error: (err) => {
        this.saving = false;
        this.toast.error(err?.error?.message || 'Failed to update status');
      }
    });
  }

  lineTotal(price: number, qty: number): number {
    return (Number(price) || 0) * (Number(qty) || 0);
  }

  trackByTitle = (_: number, item: { title: string; productId: string }) =>
    `${item.productId}-${item.title}`;
}