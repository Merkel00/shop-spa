import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API } from '../http/api';

export type SessionUser = { id: string; email: string; role: 'ADMIN' | 'USER' };

export type AuthResponse = {
  token: string;
  user: SessionUser;
};

@Injectable({ providedIn: 'root' })
export class AuthApi {
  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API.base}/auth/login`, {
      email: email.trim().toLowerCase(),
      password
    });
  }

  register(email: string, password: string, name: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API.base}/auth/register`, {
      email: email.trim().toLowerCase(),
      password,
      name: name.trim()
    });
  }
}