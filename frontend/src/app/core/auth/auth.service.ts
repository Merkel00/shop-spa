import { Injectable } from '@angular/core';
import { BehaviorSubject, map, tap } from 'rxjs';
import { AuthApi, SessionUser } from './auth.api';

type Session = { token: string; user: SessionUser };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private key = 'shop_session';
  private sub = new BehaviorSubject<SessionUser | null>(this.read()?.user ?? null);

  user$ = this.sub.asObservable();
  user = () => this.sub.value;

  isAdmin$ = this.user$.pipe(map(u => (u?.role ?? '').toUpperCase() === 'ADMIN'));
  isLoggedIn$ = this.user$.pipe(map(u => !!u));

  constructor(private api: AuthApi) {}

  token(): string | null {
    return this.read()?.token ?? null;
  }

  login(email: string, password: string) {
    return this.api.login(email, password).pipe(
      tap((res) => this.setSession(res))
    );
  }

  register(email: string, password: string, name: string) {
    return this.api.register(email, password, name).pipe(
      tap((res) => this.setSession(res))
    );
  }

  setSession(res: { token: string; user: SessionUser } | null) {
    if (!res) {
      localStorage.removeItem(this.key);
      this.sub.next(null);
      return;
    }

    const s: Session = { token: res.token, user: res.user };
    localStorage.setItem(this.key, JSON.stringify(s));
    this.sub.next(res.user);
  }

  logout() {
    this.setSession(null);
  }

  private read(): Session | null {
    try {
      const x = localStorage.getItem(this.key);
      return x ? JSON.parse(x) : null;
    } catch {
      return null;
    }
  }
}