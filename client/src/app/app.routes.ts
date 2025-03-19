import { Routes } from '@angular/router';
import { authGuard } from './helpers/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { 
    path: 'login', 
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) 
  },
  { 
    path: 'register', 
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent) 
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'tasks', 
    loadComponent: () => import('./components/task-list/task-list.component').then(m => m.TaskListComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'tasks/new', 
    loadComponent: () => import('./components/task-detail/task-detail.component').then(m => m.TaskDetailComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'tasks/:id', 
    loadComponent: () => import('./components/task-detail/task-detail.component').then(m => m.TaskDetailComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'categories', 
    loadComponent: () => import('./components/category-list/category-list.component').then(m => m.CategoryListComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'shared', 
    loadComponent: () => import('./components/shared-tasks/shared-tasks.component').then(m => m.SharedTasksComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'map', 
    loadComponent: () => import('./components/task-map/task-map.component').then(m => m.TaskMapComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/dashboard' }
];
