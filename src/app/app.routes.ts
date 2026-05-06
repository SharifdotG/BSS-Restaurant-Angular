import { Routes } from '@angular/router';

import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login').then((m) => m.Login),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./ui-components/nav/nav').then((m) => m.Nav),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadComponent: () => import('./dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'employees',
        loadComponent: () =>
          import('./employees/employee-list/employee-list').then((m) => m.EmployeeList),
      },
      {
        path: 'tables',
        loadComponent: () => import('./tables/table-list/table-list').then((m) => m.TableList),
      },
      {
        path: 'foods',
        loadComponent: () => import('./foods/food-list/food-list').then((m) => m.FoodList),
      },
      {
        path: 'new-order',
        loadComponent: () => import('./new-order/new-order/new-order').then((m) => m.NewOrder),
      },
      {
        path: 'orders',
        loadComponent: () => import('./orders/order-list/order-list').then((m) => m.OrderList),
      },
      {
        path: 'expenses',
        loadComponent: () =>
          import('./expenses/expense-list/expense-list').then((m) => m.ExpenseList),
      },
      {
        path: 'report-and-analytics',
        loadComponent: () =>
          import('./report-and-analytics/report-and-analytics').then((m) => m.ReportAndAnalytics),
      },
    ],
  },
];
