import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-order-success-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <div class="wrap">
    <h1>✅ Order created</h1>
    <p>Your order id: <b>{{ id }}</b></p>
    <a routerLink="/">Back to catalog</a>
    <a routerLink="/admin/orders" style="margin-left:12px">Admin orders</a>
  </div>
  `,
  styles: [`.wrap{padding:16px}`],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderSuccessPage {
  r = inject(ActivatedRoute);
  id = this.r.snapshot.paramMap.get('id') ?? '';
}
