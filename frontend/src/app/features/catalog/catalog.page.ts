import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ProductsStore } from '../../state/products.store';
import { Product } from '../../shared/models/product';
import { CartStore } from '../../state/cart.store';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-catalog-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './catalog.page.html',
  styleUrl: './catalog.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogPage {
  store = inject(ProductsStore);
  cart = inject(CartStore);
  auth = inject(AuthService);

  private route = inject(ActivatedRoute);
  private router = inject(Router);

  vm$ = this.store.vm$;
  user$ = this.auth.user$;

  s = '';
  c = '';
  sort: '' | 'price_asc' | 'price_desc' = '';

  skeleton = Array.from({ length: 8 });

  constructor() {
    this.route.queryParamMap.subscribe(params => {
      this.s = params.get('s') ?? '';
      this.c = params.get('c') ?? '';
      this.sort = (params.get('sort') as '' | 'price_asc' | 'price_desc') ?? '';

      const pageParam = Number(params.get('page') ?? '1');
      const page = Number.isNaN(pageParam) || pageParam < 1 ? 0 : pageParam - 1;

      this.store.setSearch(this.s);
      this.store.setCategory(this.c);
      this.store.setSort(this.sort);
      this.store.setPage(page);
    });
  }

  apply() {
    this.store.setSearch(this.s);
    this.store.setCategory(this.c);
    this.store.setSort(this.sort);

    this.router.navigate([], {
      queryParams: {
        s: this.s || null,
        c: this.c || null,
        sort: this.sort || null,
        page: 1
      },
      queryParamsHandling: 'merge'
    });
  }

  goToPage(page: number) {
    this.store.setPage(page);

    this.router.navigate([], {
      queryParams: {
        s: this.s || null,
        c: this.c || null,
        sort: this.sort || null,
        page: page + 1
      },
      queryParamsHandling: 'merge'
    });
  }

  prev(vm: { page: number; canPrev: boolean }) {
    if (!vm.canPrev) return;
    this.goToPage(vm.page - 1);
  }

  next(vm: { page: number; canNext: boolean }) {
    if (!vm.canNext) return;
    this.goToPage(vm.page + 1);
  }

  add(p: Product) {
    const u = this.auth.user();
    if (!u) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: this.router.url }
      });
      return;
    }
    this.cart.add(p);
  }
  categoryLabel(category: string | null | undefined): string {
  if (!category) return 'Other';

  return category
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

categoryClass(category: string | null | undefined): string {
  const value = (category ?? 'other').toLowerCase().replace(/\s+/g, '-');
  return `cat-${value}`;
}

stars(rating: number | null | undefined): string {
  const value = Number(rating ?? 0);
  if (!value) return '';
  return `★ ${value.toFixed(1)}`;
}

  logout() {
    this.auth.logout();
  }

  track = (_: number, x: Product) => x.id;
}