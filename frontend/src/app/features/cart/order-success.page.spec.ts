import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach } from 'vitest';

import { OrderSuccessPage } from './order-success.page';

describe('OrderSuccessPage', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OrderSuccessPage],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: 'ord-77' }),
            },
          },
        },
      ],
    });
  });

  it('reads order id from route params', () => {
    const fixture = TestBed.createComponent(OrderSuccessPage);

    expect(fixture.componentInstance.id).toBe('ord-77');
  });
});
