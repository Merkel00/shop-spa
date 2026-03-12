import { Injectable } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private key = 'shop.theme';

  get(): Theme {
    const v = (localStorage.getItem(this.key) || 'light') as Theme;
    return v === 'dark' ? 'dark' : 'light';
  }

  set(theme: Theme) {
    const t: Theme = theme === 'dark' ? 'dark' : 'light';
    localStorage.setItem(this.key, t);
    this.apply(t);
  }

  apply(theme: Theme = this.get()) {
    const t: Theme = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset['theme'] = t;
  }
}
