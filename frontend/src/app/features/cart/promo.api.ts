import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { API } from '../../core/http/api';

type PromoResp = { code: string; discountPercent: number };

@Injectable({ providedIn: 'root' })
export class PromoApi {
  constructor(private http: HttpClient) {}

  getDiscount(code: string): Observable<number | null> {
    const cleaned = (code ?? '').trim().toUpperCase();
    if (!cleaned) return of(null);

    const params = new HttpParams().set('code', cleaned);

    return this.http.get<PromoResp>(`${API.base}/promoCodes`, { params }).pipe(
      map((x) => {
        const d = Number((x as any)?.discountPercent ?? 0);
        return isFinite(d) && d > 0 ? d : 0;
      }),
      catchError(() => of(null))
    );
  }
}