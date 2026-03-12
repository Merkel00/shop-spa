import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private counter = 0;
  private sub = new BehaviorSubject<number>(0);

  isLoading$ = this.sub.asObservable().pipe(map((n) => n > 0));

  start() {
    this.counter++;
    this.sub.next(this.counter);
  }

  stop() {
    this.counter = Math.max(0, this.counter - 1);
    this.sub.next(this.counter);
  }

  reset() {
    this.counter = 0;
    this.sub.next(0);
  }
}