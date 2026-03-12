import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, switchMap, catchError } from 'rxjs';
import { API } from '../http/api';

export interface Profile {
  id: string; 
  email: string;
  name: string;
  phone: string;
  address: string;
  preferences: {
    theme: 'light' | 'dark';
    newsletter: boolean;
    favoriteCategory: string;
  };
}

@Injectable({ providedIn: 'root' })
export class ProfileApi {
  constructor(private http: HttpClient) {}

  get(id: string): Observable<Profile | null> {
    return this.http.get<Profile>(`${API.base}/profiles/${id}`).pipe(
      catchError(() => of(null))
    );
  }

  create(p: Profile): Observable<Profile> {
    return this.http.post<Profile>(`${API.base}/profiles`, p);
  }

  update(p: Profile): Observable<Profile> {
    return this.http.put<Profile>(`${API.base}/profiles/${p.id}`, p);
  }

  upsert(p: Profile): Observable<Profile> {
    return this.update(p).pipe(
      catchError(() => this.create(p))
    );
  }
}
