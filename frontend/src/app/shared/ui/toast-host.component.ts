import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../core/ui/toast.service';

@Component({
  selector: 'app-toast-host',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-host" *ngIf="toast.items$ | async as items">
      <div
        class="toast"
        *ngFor="let t of items; trackBy: trackById"
        [class.ok]="t.kind==='success'"
        [class.err]="t.kind==='error'"
        [class.info]="t.kind==='info'"
        (click)="toast.dismiss(t.id)"
        role="status"
        aria-live="polite"
      >
        <div class="dot"></div>
        <div class="msg">{{ t.message }}</div>
      </div>
    </div>
  `,
  styles: [`
    .toast-host{
      position:fixed; top:18px; right:18px; z-index:9999;
      display:flex; flex-direction:column; gap:10px;
      max-width:min(360px, calc(100vw - 36px));
    }
    .toast{
      display:flex; gap:10px; align-items:center;
      padding:10px 12px; border-radius:14px;
      border:1px solid #e5e7eb;
      background:#fff;
      box-shadow: 0 10px 30px rgba(0,0,0,.10);
      cursor:pointer;
      animation: pop .14s ease-out;
    }
    .toast .dot{ width:10px; height:10px; border-radius:999px; background:#3b82f6; flex:0 0 auto; }
    .toast.ok  .dot{ background:#10b981; }
    .toast.err .dot{ background:#ef4444; }
    .toast.info .dot{ background:#3b82f6; }
    .toast .msg{ font-size:13px; color:#111827; line-height:1.25; }
    @keyframes pop { from{ transform:translateY(-6px); opacity:.6 } to{ transform:translateY(0); opacity:1 } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastHostComponent {
  toast = inject(ToastService);
  trackById = (_: number, t: { id: string }) => t.id;
}
