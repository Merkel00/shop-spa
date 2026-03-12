import { Routes } from '@angular/router';
import { adminGuard } from './core/auth/admin.guard';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/catalog/catalog.page').then(m => m.CatalogPage) },

  { path: 'login', loadComponent: () => import('./features/auth/login.page').then(m => m.LoginPage) },
  { path: 'register', loadComponent: () => import('./features/auth/register.page').then(m => m.RegisterPage) },

  {
    path: 'profile',
    canMatch: [authGuard],
    loadComponent: () => import('./features/profile/profile.page').then(m => m.ProfilePage)
  },
  {
  path: 'orders',
  canMatch: [authGuard],
  loadComponent: () => import('./features/orders/orders.page').then(m => m.OrdersPage)
},

{
  path: 'admin',
  canMatch: [adminGuard],
  loadChildren: () => import('./features/admin/admin.routes').then(m => m.adminRoutes),
},


  { path: 'cart', loadComponent: () => import('./features/cart/cart.page').then(m => m.CartPage) },
  {
  path: 'cart/checkout',
  canMatch: [authGuard],
  loadComponent: () => import('./features/cart/checkout.page').then(m => m.CheckoutPage)
},

  { path: 'order-success/:id', loadComponent: () => import('./features/cart/order-success.page').then(m => m.OrderSuccessPage) },
  { path: 'product/:id', loadComponent: () => import('./features/catalog/product.page').then(m => m.ProductPage) },
  { path: 'not-authorized', loadComponent: () => import('./features/auth/not-authorized.page').then(m => m.NotAuthorizedPage) },
];
