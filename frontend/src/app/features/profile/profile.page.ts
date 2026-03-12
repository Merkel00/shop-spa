import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProfileApi, Profile } from '../../core/profile/profile.api';
import { AuthService } from '../../core/auth/auth.service';
import { finalize } from 'rxjs';
import { ToastService } from '../../core/ui/toast.service';
import { ThemeService } from '../../core/ui/theme.service';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './profile.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfilePage {
  private fb = inject(FormBuilder);
  private api = inject(ProfileApi);
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private toast = inject(ToastService);
  private theme = inject(ThemeService);

  loading = false;
  saving = false;
  err = '';
  ok = '';

  form = this.fb.group({
    email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
    name: ['', [Validators.required, Validators.minLength(2)]],
    phone: [''],
    address: [''],
    theme: ['light' as 'light' | 'dark'],
    newsletter: [false],
    favoriteCategory: ['']
  });


  ngOnInit() {
    const u = this.auth.user();
    if (!u) return;

    this.loading = true;
    this.err = '';
    this.ok = '';
    this.cdr.markForCheck();

    this.api.get(u.id).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (p) => {
        const profile: Profile = p ?? {
          id: u.id,
          email: u.email,
          name: u.email.split('@')[0] ?? '',
          phone: '',
          address: '',
          preferences: { theme: 'light', newsletter: false, favoriteCategory: '' }
        };

        this.form.patchValue({
          email: profile.email,
          name: profile.name,
          phone: profile.phone,
          address: profile.address,
          theme: profile.preferences.theme,
          newsletter: profile.preferences.newsletter,
          favoriteCategory: profile.preferences.favoriteCategory
        }, { emitEvent: false });
   

        this.cdr.markForCheck();
      },
      error: () => {
  this.cdr.markForCheck();
      }
    });
  }

  save() {
    this.ok = '';
    this.err = '';
    this.cdr.markForCheck();

    const u = this.auth.user();
    if (!u) {
      this.err = 'Not logged in';
      this.cdr.markForCheck();
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.cdr.markForCheck();
      return;
    }

    const v = this.form.getRawValue();

    const payload: Profile = {
      id: u.id,
      email: u.email,
      name: String(v.name ?? ''),
      phone: String(v.phone ?? ''),
      address: String(v.address ?? ''),
      preferences: {
        theme: (v.theme ?? 'light') as 'light' | 'dark',
        newsletter: !!v.newsletter,
        favoriteCategory: String(v.favoriteCategory ?? '')
      }
    };

    this.saving = true;
    this.cdr.markForCheck();

    this.api.upsert(payload).pipe(
      finalize(() => {
        this.saving = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: () => {
        this.ok = 'Saved!';
        this.toast.success('Profile saved');
        this.cdr.markForCheck();
        this.theme.set(payload.preferences.theme); 
      },
      error: () => {
        this.err = 'Save failed';
        this.toast.error('Profile save failed');
        this.cdr.markForCheck();
      }
    });
  }
}
