import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { catchError, combineLatest, map, of, shareReplay, switchMap } from 'rxjs';

import { ProductsApi } from '../../core/products/products.api';
import { CartStore } from '../../state/cart.store';
import { ToastService } from '../../core/ui/toast.service';

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product.page.html',
  styleUrls: ['./product.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductPage {
  private route = inject(ActivatedRoute);
  private api = inject(ProductsApi);
  private cart = inject(CartStore);
  private toast = inject(ToastService);

vm$ = this.route.paramMap.pipe(
  map((pm) => String(pm.get('id') || '')),
  switchMap((id) =>
    combineLatest([
      this.api.getById(id).pipe(
        catchError(() => of(null))
      ),
      this.api.getAll().pipe( 
        catchError(() => of([]))
      )
    ]).pipe(
      map(([product, all]) => {
        if (!product) {
          return { product: null as any, related: [], error: 'Product not found' };
        }

        const related = (all || [])
          .filter((x: any) => x?.id !== product.id && x?.category === product.category)
          .slice(0, 4);

        return { product, related, error: '' };
      })
    )
  ),
  shareReplay({ bufferSize: 1, refCount: true })
);

  add(p: any) {
    this.cart.add(p);
    this.toast.success('Added to cart');
  }
}