import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { inject } from '@angular/core';
import { AuthApi } from './auth.api';
import { map, of, catchError } from 'rxjs';


export function emailTakenValidator(): AsyncValidatorFn {
  return () => of(null);
}
