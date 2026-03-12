import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { isObservable, of, throwError, firstValueFrom } from 'rxjs';
import { AuthApi } from './auth.api';
import { emailTakenValidator } from './email-taken.validator';

describe('emailTakenValidator', () => {
  let api: { findUserByEmail: any };

  async function run(v: ReturnType<typeof emailTakenValidator>, c: FormControl) {
    const out = v(c); 
    return isObservable(out) ? await firstValueFrom(out) : await out;
  }

  beforeEach(() => {
    api = { findUserByEmail: vi.fn() };

    TestBed.configureTestingModule({
      providers: [{ provide: AuthApi, useValue: api }],
    });
  });

  it('returns null for empty value and does not call api', async () => {
    const v = TestBed.runInInjectionContext(() => emailTakenValidator());

    const c = new FormControl('');
    const res = await run(v, c);

    expect(res).toBeNull();
    expect(api.findUserByEmail).not.toHaveBeenCalled();
  });

  it('returns {emailTaken:true} when api returns existing users', async () => {
    api.findUserByEmail.mockReturnValue(
      of([{ id: 1, email: 'x@x.com', password: 'p', role: 'user' }])
    );

    const v = TestBed.runInInjectionContext(() => emailTakenValidator());

    const c = new FormControl('  X@X.COM  ');
    const res = await run(v, c);

    expect(res).toEqual({ emailTaken: true });
    expect(api.findUserByEmail).toHaveBeenCalledWith('x@x.com');
  });

  it('returns null when api returns empty list', async () => {
    api.findUserByEmail.mockReturnValue(of([]));

    const v = TestBed.runInInjectionContext(() => emailTakenValidator());

    const c = new FormControl('free@x.com');
    const res = await run(v, c);

    expect(res).toBeNull();
  });

  it('returns null when api errors (do not block form)', async () => {
    api.findUserByEmail.mockReturnValue(throwError(() => new Error('network')));

    const v = TestBed.runInInjectionContext(() => emailTakenValidator());

    const c = new FormControl('x@x.com');
    const res = await run(v, c);

    expect(res).toBeNull();
  });
});
