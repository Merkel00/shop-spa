import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-authorized-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="na">
      <h1>Not authorized</h1>
      <p>You don’t have permission to access this page.</p>

      <div class="actions">
        <a routerLink="/" class="btn">Go to catalog</a>
        <a routerLink="/profile" class="btn ghost">Profile</a>
      </div>
    </div>
  `,
  styles: [`
    .na { max-width: 520px; margin: 48px auto; padding: 16px; }
    h1 { margin: 0 0 8px; }
    p { margin: 0 0 16px; opacity: .85; }
    .actions { display: flex; gap: 12px; }
    .btn { display: inline-block; padding: 8px 12px; border-radius: 10px; text-decoration: none; border: 1px solid rgba(0,0,0,.12); }
    .ghost { opacity: .85; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotAuthorizedPage {}