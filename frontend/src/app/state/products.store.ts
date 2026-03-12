import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  shareReplay,
  switchMap,
  startWith
} from 'rxjs/operators';
import { Product } from '../shared/models/product';
import { ProductsApi } from '../core/products/products.api';

type Sort = 'price_asc' | 'price_desc' | '';

type Vm = {
  items: Product[];
  categories: string[];
  total: number;
  totalPages: number;
  page: number;
  canPrev: boolean;
  canNext: boolean;
  loading: boolean;
  error: string;
};

@Injectable({ providedIn: 'root' })
export class ProductsStore {
  private searchSub = new BehaviorSubject<string>('');
  private categorySub = new BehaviorSubject<string>('');
  private sortSub = new BehaviorSubject<Sort>('');
  private pageSub = new BehaviorSubject<number>(0);
  private refreshSub = new BehaviorSubject<number>(0);

  search$ = this.searchSub.asObservable();
  category$ = this.categorySub.asObservable();
  sort$ = this.sortSub.asObservable();
  page$ = this.pageSub.asObservable();

  private query$ = combineLatest([
    this.search$.pipe(debounceTime(250), distinctUntilChanged()),
    this.category$.pipe(distinctUntilChanged()),
    this.sort$.pipe(distinctUntilChanged()),
    this.page$.pipe(distinctUntilChanged()),
    this.refreshSub.asObservable()
  ]).pipe(
    map(([search, category, sort, page]) => ({
      search: search.trim(),
      category: category.trim(),
      sort,
      page
    })),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  vm$ = this.query$.pipe(
    switchMap((q) =>
      combineLatest([
        this.api.list({
          page: q.page,
          size: 8,
          search: q.search,
          category: q.category,
          sort: q.sort
        }),
        this.api.getCategories()
      ]).pipe(
        map(([pageRes, categories]) => ({
          items: pageRes.content ?? [],
          categories: categories ?? [],
          total: pageRes.totalElements ?? 0,
          totalPages: pageRes.totalPages ?? 0,
          page: pageRes.number ?? 0,
          canPrev: (pageRes.number ?? 0) > 0,
          canNext: (pageRes.number ?? 0) + 1 < (pageRes.totalPages ?? 0),
          loading: false,
          error: ''
        }) as Vm),
        startWith({
          items: [],
          categories: [],
          total: 0,
          totalPages: 0,
          page: 0,
          canPrev: false,
          canNext: false,
          loading: true,
          error: ''
        } as Vm),
        catchError((e) =>
          of({
            items: [],
            categories: [],
            total: 0,
            totalPages: 0,
            page: 0,
            canPrev: false,
            canNext: false,
            loading: false,
            error: String(e?.message ?? e)
          } as Vm)
        )
      )
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(private api: ProductsApi) {}

  setSearch(v: string) {
    this.searchSub.next(v);
    this.pageSub.next(0);
  }

  setCategory(v: string) {
    this.categorySub.next(v);
    this.pageSub.next(0);
  }

  setSort(v: Sort) {
    this.sortSub.next(v);
    this.pageSub.next(0);
  }

  setPage(page: number) {
    this.pageSub.next(Math.max(0, page));
  }

  prevPage() {
    this.setPage(this.pageSub.value - 1);
  }

  nextPage() {
    this.setPage(this.pageSub.value + 1);
  }

  refresh() {
    this.refreshSub.next(this.refreshSub.value + 1);
  }
}