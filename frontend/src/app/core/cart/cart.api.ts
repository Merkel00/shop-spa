import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API } from '../http/api';
import { Product } from '../../shared/models/product';

export interface CartItem {
  id: number;
  qty: number;
  product: Product;
}

export interface CartResponse {
  items: CartItem[];
  total: number;
  count: number;
}

@Injectable({ providedIn: 'root' })
export class CartApi {
  constructor(private http: HttpClient) {}

  getCart(): Observable<CartResponse> {
    return this.http.get<CartResponse>(`${API.base}/cart`);
  }

  addItem(productId: number | string, qty = 1): Observable<CartResponse> {
    return this.http.post<CartResponse>(`${API.base}/cart/items`, {
      productId: Number(productId),
      qty
    });
  }

  updateItem(itemId: number, qty: number): Observable<CartResponse> {
    return this.http.put<CartResponse>(`${API.base}/cart/items/${itemId}`, { qty });
  }

  removeItem(itemId: number): Observable<CartResponse> {
    return this.http.delete<CartResponse>(`${API.base}/cart/items/${itemId}`);
  }

  clear(): Observable<CartResponse> {
    return this.http.delete<CartResponse>(`${API.base}/cart/clear`);
  }
}