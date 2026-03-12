import { CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map, take } from 'rxjs';
import { AuthService } from './auth.service';

export const authGuard: CanMatchFn = (route, segments) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const returnUrl = '/' + segments.map((s) => s.path).join('/');

  return auth.user$.pipe(
    take(1),
    map((u) => (u ? true : router.createUrlTree(['/login'], { queryParams: { returnUrl } })))
  );
};