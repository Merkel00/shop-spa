import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { emailTakenValidator } from '../../core/auth/email-taken.validator';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const p = String(group.get('password')?.value ?? '');
  const c = String(group.get('confirmPassword')?.value ?? '');
  if (!c) return null;
  return p === c ? null : { passwordsMismatch: true };
}

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './register.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterPage {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  saving = false;
  err = '';

  form = this.fb.group(
    {
      email: [
        '',
        {
          validators: [Validators.required, Validators.email],
          asyncValidators: [emailTakenValidator()],
          updateOn: 'blur'
        }
      ],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]]
    },
    { validators: [passwordsMatch] }
  );

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

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const email = String(v.email ?? '').trim().toLowerCase();
    const password = String(v.password ?? '');
    const name = String(v.name ?? '').trim();

    const rawReturnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    const returnUrl = this.safeReturnUrl(rawReturnUrl);

    this.saving = true;

    try {
      await firstValueFrom(this.auth.register(email, password, name));
      await this.router.navigateByUrl(returnUrl ?? '/profile');
    } catch (e: any) {
      this.err = e?.error?.message ?? e?.message ?? 'Register failed';
    } finally {
      this.saving = false;
    }
  }
}