import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AsyncPipe, CommonModule, NgIf } from '@angular/common';
import { AuthService } from './core/auth/auth.service';
import { CartStore } from './state/cart.store';
import { ToastHostComponent } from './shared/ui/toast-host.component';
import { LoadingOverlayComponent } from './shared/ui/loading-overlay.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, AsyncPipe, NgIf, ToastHostComponent, LoadingOverlayComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  private auth = inject(AuthService);
  private cart = inject(CartStore);
  private router = inject(Router);

  isLoggedIn$ = this.auth.isLoggedIn$;
  isAdmin$ = this.auth.isAdmin$;
  cartCount$ = this.cart.count$;

  async logout() {
    this.auth.logout();
    this.cart.clear();
    await this.router.navigateByUrl('/');
  }
}