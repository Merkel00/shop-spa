import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastKind = 'success' | 'error' | 'info';

export type ToastItem = {
  id: string;
  kind: ToastKind;
  message: string;
  createdAt: number;
  ttlMs: number;
};

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts() {
  return this._items.value;
}

  private readonly _items = new BehaviorSubject<ToastItem[]>([]);
  readonly items$ = this._items.asObservable();

  show(message: string, kind: ToastKind = 'info', ttlMs = 2600) {
    const item: ToastItem = { id: uid(), kind, message, createdAt: Date.now(), ttlMs };
    const next = [item, ...this._items.value].slice(0, 4);
    this._items.next(next);

    window.setTimeout(() => this.dismiss(item.id), ttlMs);
  }

  success(msg: string, ttlMs?: number) { this.show(msg, 'success', ttlMs ?? 2400); }
  error(msg: string, ttlMs?: number) { this.show(msg, 'error', ttlMs ?? 3000); }
  info(msg: string, ttlMs?: number) { this.show(msg, 'info', ttlMs ?? 2600); }

  dismiss(id: string) {
    this._items.next(this._items.value.filter(x => x.id !== id));
  }

  clear() {
    this._items.next([]);
  }
}
