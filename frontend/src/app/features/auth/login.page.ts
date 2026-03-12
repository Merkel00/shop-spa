import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginPage {
  fb = inject(FormBuilder);
  auth = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  err = '';

  f = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(3)]]
  });

  private safeReturnUrl(raw: unknown): string | null {
    const u = typeof raw === 'string' ? raw : '';
    if (!u) return null;

    if (!u.startsWith('/')) return null;
    if (u.startsWith('//')) return null;
    if (u.includes('://')) return null;

    return u;
  }

  async submit() {
    this.err = '';
    if (this.f.invalid) {
      this.f.markAllAsTouched();
      return;
    }

    const v = this.f.getRawValue();

    try {
     const res = await firstValueFrom(this.auth.login(String(v.email), String(v.password)));
     const s = res.user;

      const rawReturnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
      const returnUrl = this.safeReturnUrl(rawReturnUrl);

      const fallback = s.role === 'ADMIN' ? '/admin' : '/profile';
      await this.router.navigateByUrl(returnUrl ?? fallback);
    } catch (e: any) {
      this.err = e?.message ?? 'Login failed';
    }
  }
}