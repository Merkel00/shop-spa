import { AsyncValidatorFn } from '@angular/forms';
import { inject } from '@angular/core';
import { map, of, catchError } from 'rxjs';
import { AuthApi } from './auth.api';

export function emailTakenValidator(): AsyncValidatorFn {
  const api = inject(AuthApi);

  return (control) => {
    const email = String(control.value ?? '').trim().toLowerCase();

    if (!email) {
      return of(null);
    }

    return api.findUserByEmail(email).pipe(
      map((users: unknown[]) => (users.length > 0 ? { emailTaken: true } : null)),
      catchError(() => of(null))
    );
  };
}