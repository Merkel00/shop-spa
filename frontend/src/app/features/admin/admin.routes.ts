import { Routes } from '@angular/router';
import { adminGuard } from '../../core/auth/admin.guard';

export const adminRoutes: Routes = [
  {
    path: '',
    canMatch: [adminGuard],
    children: [
      { path: '', loadComponent: () => import('./admin-dashboard.page').then((m) => m.AdminDashboardPage) },
      { path: 'orders/:id', loadComponent: () => import('./admin-order-details.page').then((m) => m.AdminOrderDetailsPage) },
      { path: 'orders', loadComponent: () => import('./admin-orders.page').then((m) => m.AdminOrdersPage) },
      { path: 'products', loadComponent: () => import('./admin-products.page').then((m) => m.AdminProductsPage) }
    ]
  }
];