import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../../shared/models/product';
import { API } from '../http/api';
import { PageResponse } from '../../shared/models/page';

type Sort = 'price_asc' | 'price_desc' | '';

@Injectable({ providedIn: 'root' })
export class ProductsApi {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(`${API.base}/products/all`);
  }

  list(params?: {
    page?: number;
    size?: number;
    search?: string;
    category?: string;
    sort?: Sort;
  }): Observable<PageResponse<Product>> {
    let httpParams = new HttpParams()
      .set('page', String(params?.page ?? 0))
      .set('size', String(params?.size ?? 8));

    const search = params?.search?.trim();
    const category = params?.category?.trim();

    if (search) {
      httpParams = httpParams.set('search', search);
    }

    if (category) {
      httpParams = httpParams.set('category', category);
    }

    const backendSort =
      params?.sort === 'price_asc'
        ? 'price,asc'
        : params?.sort === 'price_desc'
        ? 'price,desc'
        : 'id,asc';

    httpParams = httpParams.set('sort', backendSort);

    return this.http.get<PageResponse<Product>>(`${API.base}/products`, {
      params: httpParams
    });
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${API.base}/products/categories`);
  }

  getById(id: string): Observable<Product> {
    return this.http.get<Product>(`${API.base}/products/${id}`);
  }

  create(p: Omit<Product, 'id'>): Observable<Product> {
    return this.http.post<Product>(`${API.base}/products`, p);
  }

  update(p: Product): Observable<Product> {
    const payload = {
      title: p.title,
      price: p.price,
      stock: p.stock,
      category: p.category,
      image: p.image,
      description: p.description,
    };
    return this.http.put<Product>(`${API.base}/products/${p.id}`, payload);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${API.base}/products/${id}`);
  }
}