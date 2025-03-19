import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthStore } from '../../stores/auth.store';
import { LoginRequest } from '../../models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h3 class="text-center">Login</h3>
            </div>
            <div class="card-body">
              <div *ngIf="successMessage" class="alert alert-success mb-3">
                {{ successMessage }}
              </div>
              
              <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label for="username" class="form-label">Username</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="username" 
                    formControlName="username"
                    [ngClass]="{'is-invalid': submitted && loginForm.controls['username'].errors}"
                  >
                  <div *ngIf="submitted && loginForm.controls['username'].errors" class="invalid-feedback">
                    <div *ngIf="loginForm.controls['username'].errors['required']">Username is required</div>
                  </div>
                </div>
                
                <div class="mb-3">
                  <label for="password" class="form-label">Password</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="password" 
                    formControlName="password"
                    [ngClass]="{'is-invalid': submitted && loginForm.controls['password'].errors}"
                  >
                  <div *ngIf="submitted && loginForm.controls['password'].errors" class="invalid-feedback">
                    <div *ngIf="loginForm.controls['password'].errors['required']">Password is required</div>
                  </div>
                </div>
                
                <div *ngIf="error" class="alert alert-danger">
                  {{ error }}
                </div>
                
                <div class="d-grid gap-2">
                  <button 
                    type="submit" 
                    class="btn btn-primary"
                    [disabled]="loading"
                  >
                    <span *ngIf="loading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    Login
                  </button>
                </div>
                
                <div class="mt-3 text-center">
                  <p>Don't have an account? <a routerLink="/register">Register</a></p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  error: string | null = null;
  successMessage: string | null = null;
  
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authStore: AuthStore
  ) {}
  
  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
    
    // Check if user was redirected from registration
    this.route.queryParams.subscribe(params => {
      if (params['registered'] === 'true') {
        this.successMessage = 'Registration successful! You can now log in with your credentials.';
      }
    });
    
    this.authStore.isLoading$.subscribe((loading: boolean) => {
      this.loading = loading;
    });
    
    this.authStore.error$.subscribe((error: string | null) => {
      this.error = error;
    });
    
    this.authStore.isLoggedIn$.subscribe((isLoggedIn: boolean) => {
      if (isLoggedIn) {
        this.router.navigate(['/dashboard']);
      }
    });
  }
  
  onSubmit(): void {
    this.submitted = true;
    this.successMessage = null;
    
    if (this.loginForm.invalid) {
      return;
    }
    
    const { username, password } = this.loginForm.value;
    
    const loginRequest: LoginRequest = {
      username,
      password
    };
    
    this.authStore.login(loginRequest);
  }
} 