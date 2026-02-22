import { Routes } from '@angular/router';

import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Redirect raíz
  {
    path: '',
    redirectTo: '/app/warehouses',
    pathMatch: 'full',
  },

  // Rutas de autenticación (sin sidebar, sin topbar)
  {
    path: 'auth',
    component: AuthLayoutComponent,
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/components/login/login.component').then(
            m => m.LoginComponent,
          ),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/components/register/register.component').then(
            m => m.RegisterComponent,
          ),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },

  // Rutas protegidas (con layout completo + chat sidebar)
  {
    path: 'app',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'warehouses',
        loadComponent: () =>
          import(
            './features/warehouses/components/warehouse-list/warehouse-list.component'
          ).then(m => m.WarehouseListComponent),
      },
      {
        path: 'warehouses/:id',
        loadComponent: () =>
          import(
            './features/warehouses/components/warehouse-detail/warehouse-detail.component'
          ).then(m => m.WarehouseDetailComponent),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/components/profile/profile.component').then(
            m => m.ProfileComponent,
          ),
      },
      { path: '', redirectTo: 'warehouses', pathMatch: 'full' },
    ],
  },

  // Wildcard
  { path: '**', redirectTo: '/app/warehouses' },
];
