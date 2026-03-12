import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../ui/toast.service';

function extractErrorMessage(error: HttpErrorResponse): string {
  const body = error.error;

  if (typeof body === 'string' && body.trim()) {
    return body;
  }

  if (body?.message && typeof body.message === 'string') {
    return body.message;
  }

  if (body?.error && typeof body.error === 'string') {
    return body.error;
  }

  if (error.status === 0) {
    return 'Network error';
  }

  switch (error.status) {
    case 400:
      return 'Bad request';
    case 401:
      return 'Unauthorized';
    case 403:
      return 'Forbidden';
    case 404:
      return 'Not found';
    case 409:
      return 'Conflict';
    case 500:
      return 'Server error';
    default:
      return 'Request failed';
  }
}

function shouldSkipToast(error: HttpErrorResponse): boolean {
  const url = error.url ?? '';

  if (url.includes('/promoCodes')) {
    return true;
  }

  return false;
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (!shouldSkipToast(error)) {
        toast.error(extractErrorMessage(error));
      }

      return throwError(() => error);
    })
  );
};