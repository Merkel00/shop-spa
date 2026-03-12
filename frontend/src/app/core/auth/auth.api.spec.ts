import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AuthApi } from './auth.api';
import { provideHttpClient } from '@angular/common/http';

describe('AuthApi', () => {
  let api: AuthApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthApi,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    api = TestBed.inject(AuthApi);
    http = TestBed.inject(HttpTestingController);
  });

  it('calls correct endpoint on findUserByEmail', () => {
    api.findUserByEmail('test@test.com').subscribe();

    const req = http.expectOne(r =>
      r.url.includes('/users') &&
      r.params.get('email') === 'test@test.com'
    );

    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});
