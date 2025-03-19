import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthStore } from './stores/auth.store';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    RouterModule, 
    CommonModule
  ],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <a class="navbar-brand fw-bold" routerLink="/">
          <i class="bi bi-check2-square me-2"></i>Task Manager
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item" *ngIf="isLoggedIn">
              <a class="nav-link" routerLink="/dashboard" routerLinkActive="active fw-medium">
                <i class="bi bi-speedometer2 me-1"></i> Dashboard
              </a>
            </li>
            <li class="nav-item" *ngIf="isLoggedIn">
              <a class="nav-link" routerLink="/tasks" routerLinkActive="active fw-medium">
                <i class="bi bi-list-task me-1"></i> My Tasks
              </a>
            </li>
            <li class="nav-item" *ngIf="isLoggedIn">
              <a class="nav-link" routerLink="/shared" routerLinkActive="active fw-medium">
                <i class="bi bi-people me-1"></i> Shared Tasks
              </a>
            </li>
            <li class="nav-item" *ngIf="isLoggedIn">
              <a class="nav-link" routerLink="/categories" routerLinkActive="active fw-medium">
                <i class="bi bi-tags me-1"></i> Categories
              </a>
            </li>
            <li class="nav-item" *ngIf="isLoggedIn">
              <a class="nav-link" routerLink="/map" routerLinkActive="active fw-medium">
                <i class="bi bi-geo-alt me-1"></i> Task Map
              </a>
            </li>
          </ul>
          <ul class="navbar-nav">
            <li class="nav-item" *ngIf="!isLoggedIn">
              <a class="nav-link" routerLink="/login" routerLinkActive="active fw-medium">
                <i class="bi bi-box-arrow-in-right me-1"></i> Login
              </a>
            </li>
            <li class="nav-item" *ngIf="!isLoggedIn">
              <a class="nav-link" routerLink="/register" routerLinkActive="active fw-medium">
                <i class="bi bi-person-plus me-1"></i> Register
              </a>
            </li>
            <li class="nav-item d-flex align-items-center" *ngIf="isLoggedIn">
              <span class="nav-link text-light me-3">
                <i class="bi bi-person-circle me-1"></i>
                Welcome, {{ username }}
              </span>
            </li>
            <li class="nav-item" *ngIf="isLoggedIn">
              <a class="nav-link" href="#" (click)="logout($event)">
                <i class="bi bi-box-arrow-right me-1"></i> Logout
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <router-outlet></router-outlet>
  `,
  styles: [`
    .navbar {
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%) !important;
      padding: 0.75rem 1rem;
    }
    
    .navbar-brand {
      font-size: 1.5rem;
      letter-spacing: 0.5px;
    }
    
    .nav-link {
      padding: 0.5rem 1rem;
      border-radius: 4px;
      margin: 0 0.15rem;
      transition: all 0.2s ease;
    }
    
    .nav-link:hover, .nav-link.active {
      background-color: rgba(255, 255, 255, 0.15);
    }
  `]
})
export class AppComponent {
  isLoggedIn = false;
  username = '';

  constructor(private authStore: AuthStore) {
    this.authStore.isLoggedIn$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
    });
    
    this.authStore.user$.subscribe(user => {
      if (user) {
        this.username = user.username;
      }
    });
  }

  logout(event: Event): void {
    event.preventDefault();
    this.authStore.logout();
  }
}
