import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductsApi } from '../../core/products/products.api';
import { Product } from '../../shared/models/product';
import { finalize } from 'rxjs';
import { ToastService } from '../../core/ui/toast.service';

@Component({
  selector: 'app-admin-products-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './admin-products.page.html',
  styleUrls: ['./admin-products.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminProductsPage {
  private fb = inject(FormBuilder);
  private api = inject(ProductsApi);
  private toast = inject(ToastService);
  editingId: string | null = null;
  products$ = this.api.getAll();

  saving = false;
  err = '';
  ok = '';

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    price: [0, [Validators.required, Validators.min(1)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    category: ['', [Validators.required]],
    image: ['', [Validators.required]],
    description: ['', [Validators.required, Validators.minLength(10)]],
  });

  reload() {
    this.products$ = this.api.getAll();
  }

  add() {
    if (this.editingId) {
  this.err = 'Cancel editing before adding a new product';
  return;
}
    this.ok = '';
    this.err = '';
    this.toast.success('Product added')
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const payload: Omit<Product, 'id'> = {
      title: String(v.title ?? ''),
      price: Number(v.price ?? 0),
      stock: Number(v.stock ?? 0),
      category: String(v.category ?? ''),
      image: String(v.image ?? ''),
      description: String(v.description ?? ''),
    };

    this.saving = true;
    this.api.create(payload).pipe(
      finalize(() => (this.saving = false))
    ).subscribe({
      next: () => {
        this.ok = 'Product added';
        this.form.reset({ title: '', price: 0, stock: 0, category: '', image: '', description: '' });
        this.reload();
      },
      error: () => (this.err = 'Failed to add product')
    });
  }

  remove(id: string) {
    this.api.remove(id).subscribe(() => this.reload());
    this.toast.info('Product deleted');
  }

  trackById = (_: number, x: Product) => x.id;
  edit(p: Product) {
  this.ok = '';
  this.err = '';
  this.editingId = p.id;

  this.form.reset({
    title: p.title ?? '',
    price: p.price ?? 0,
    stock: p.stock ?? 0,
    category: String(p.category ?? ''),
    image: p.image ?? '',
    description: p.description ?? '',
  });
}

cancelEdit() {
  this.editingId = null;
  this.form.reset({ title: '', price: 0, stock: 0, category: '', image: '', description: '' });
}

save() {
  this.ok = '';
  this.err = '';

  if (!this.editingId) return;

  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  const v = this.form.getRawValue();
  const payload: Product = {
    id: this.editingId,
    title: String(v.title ?? ''),
    price: Number(v.price ?? 0),
    stock: Number(v.stock ?? 0),
    category: String(v.category ?? ''),
    image: String(v.image ?? ''),
    description: String(v.description ?? ''),
  };

  this.saving = true;
  this.api.update(payload).pipe(
    finalize(() => (this.saving = false))
  ).subscribe({
    next: () => {
      this.ok = 'Product updated';
      this.toast.success('Product updated');
      this.cancelEdit();
      this.reload();
    },
    error: () => {
      this.err = 'Failed to update product';
    }
  });
}
}
