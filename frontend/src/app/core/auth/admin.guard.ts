import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { AuthService } from './auth.service';

export const adminGuard: CanMatchFn = (route, segments) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const returnUrl = '/' + segments.map((s) => s.path).join('/');

  return auth.user$.pipe(
    take(1),
    map((u) => {
      if (!u) return router.createUrlTree(['/login'], { queryParams: { returnUrl } });
      if ((u.role ?? '').toUpperCase() !== 'ADMIN') {
        return router.createUrlTree(['/not-authorized']);
      }
      return true;
    })
  );
};