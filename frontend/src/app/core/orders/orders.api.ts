import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Order, OrderStatus } from '../../shared/models/order';
import { API } from '../http/api';

export type CreateOrderRequest = {
  shippingAddress: string;
  promoCode?: string | null;
};

export type UpdateOrderStatusRequest = {
  status: OrderStatus;
};

@Injectable({ providedIn: 'root' })
export class OrdersApi {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Order[]> {
    return this.http.get<Order[]>(`${API.base}/orders`)
      .pipe(map(list => list.map(this.normalize)));
  }

  getAllAdmin(): Observable<Order[]> {
    return this.http.get<Order[]>(`${API.base}/orders/admin`)
      .pipe(map(list => list.map(this.normalize)));
  }

  getById(id: string | number): Observable<Order> {
    return this.http.get<Order>(`${API.base}/orders/${id}`)
      .pipe(map(this.normalize));
  }

  getAdminById(id: string | number): Observable<Order> {
    return this.http.get<Order>(`${API.base}/orders/admin/${id}`)
      .pipe(map(this.normalize));
  }

  create(req: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(`${API.base}/orders`, req)
      .pipe(map(this.normalize));
  }

  updateStatus(id: string | number, status: OrderStatus): Observable<Order> {
    return this.http.patch<Order>(`${API.base}/orders/${id}/status`, { status })
      .pipe(map(this.normalize));
  }

  private normalize = (o: any): Order => ({
    ...o,
    createdAt: this.parseDate(o.createdAt),
    customer: o.customer ?? { name: '', email: '', address: '' },
    items: o.items ?? [],
    subtotal: Number(o.subtotal ?? 0),
    discountPercent: Number(o.discountPercent ?? 0),
    total: Number(o.total ?? 0),
    status: o.status ?? 'NEW',
  });

  private parseDate = (v: any): string => {
    if (!v) return '';
    const d = new Date(v);
    return isNaN(d.getTime()) ? '' : d.toISOString();
  };
}