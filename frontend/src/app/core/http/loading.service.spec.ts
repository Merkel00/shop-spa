import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { describe, it, expect, beforeEach } from 'vitest';

import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoadingService],
    });

    service = TestBed.inject(LoadingService);
  });

  it('toggles loading state as requests start and stop', async () => {
    expect(await firstValueFrom(service.isLoading$)).toBe(false);

    service.start();
    expect(await firstValueFrom(service.isLoading$)).toBe(true);

    service.start();
    expect(await firstValueFrom(service.isLoading$)).toBe(true);

    service.stop();
    expect(await firstValueFrom(service.isLoading$)).toBe(true);

    service.stop();
    expect(await firstValueFrom(service.isLoading$)).toBe(false);
  });

  it('does not go below zero and reset clears state', async () => {
    service.stop();
    expect(await firstValueFrom(service.isLoading$)).toBe(false);

    service.start();
    service.reset();

    expect(await firstValueFrom(service.isLoading$)).toBe(false);
  });
});
