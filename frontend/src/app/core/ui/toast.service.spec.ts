import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';
import { firstValueFrom, take } from 'rxjs';

describe('ToastService', () => {
  let svc: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ToastService] });
    svc = TestBed.inject(ToastService);
  });

  it('starts empty', () => {
    expect(svc.toasts()).toEqual([]);
  });

  it('show adds toast (max 4) and items$ emits', async () => {
    svc.show('a');
    svc.show('b');
    svc.show('c');
    svc.show('d');
    svc.show('e');

    const snap = svc.toasts();
    expect(snap.length).toBe(4);
    expect(snap[0].message).toBe('e');

    const once = await firstValueFrom(svc.items$.pipe(take(1)));
    expect(Array.isArray(once)).toBe(true);
  });

  it('success/error/info set correct kind', () => {
    svc.success('ok');
    expect(svc.toasts()[0].kind).toBe('success');

    svc.error('bad');
    expect(svc.toasts()[0].kind).toBe('error');

    svc.info('hi');
    expect(svc.toasts()[0].kind).toBe('info');
  });

  it('dismiss removes by id', () => {
    svc.show('x');
    const id = svc.toasts()[0].id;

    svc.dismiss(id);

    expect(svc.toasts().find(t => t.id === id)).toBeUndefined();
  });

  it('clear removes all', () => {
    svc.show('x');
    svc.show('y');

    svc.clear();

    expect(svc.toasts()).toEqual([]);
  });

  it('auto dismiss after ttl', () => {
    vi.useFakeTimers();
    try {
      svc.show('x', 'info', 1000);
      const id = svc.toasts()[0].id;
      expect(svc.toasts().length).toBe(1);

      vi.advanceTimersByTime(1000);

      expect(svc.toasts().find(t => t.id === id)).toBeUndefined();
    } finally {
      vi.useRealTimers();
    }
  });
});
