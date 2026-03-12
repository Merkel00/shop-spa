import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../core/http/loading.service';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overlay" *ngIf="(loading$ | async)">
      <div class="spinner" aria-label="Loading"></div>
    </div>
  `,
  styles: [`
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(255,255,255,0.6);
      display: grid;
      place-items: center;
      z-index: 9999;
      backdrop-filter: blur(2px);
    }
    .spinner {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: 4px solid rgba(0,0,0,0.12);
      border-top-color: rgba(0,0,0,0.55);
      animation: spin 0.9s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingOverlayComponent {
  private loading = inject(LoadingService);
  loading$ = this.loading.isLoading$;
}