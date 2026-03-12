import { TestBed } from '@angular/core/testing';
import { ToastHostComponent } from './toast-host.component';
import { ToastService } from '../../core/ui/toast.service';

describe('ToastHostComponent', () => {
  it('renders toasts and dismisses on click', () => {
    TestBed.configureTestingModule({
      imports: [ToastHostComponent],
    });

    const svc = TestBed.inject(ToastService);
    const fixture = TestBed.createComponent(ToastHostComponent);

    svc.show('hello', 'success', 999999);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const toast = el.querySelector('.toast') as HTMLElement;

    expect(toast).toBeTruthy();
    expect(toast.textContent).toContain('hello');

    toast.click();
    fixture.detectChanges();

    expect(svc.toasts().length).toBe(0);
  });
});
