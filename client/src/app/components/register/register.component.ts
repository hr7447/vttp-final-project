import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthStore } from '../../stores/auth.store';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h3 class="text-center">Register</h3>
            </div>
            <div class="card-body">
              <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label for="username" class="form-label">Username</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="username" 
                    formControlName="username"
                    [ngClass]="{'is-invalid': submitted && registerForm.controls['username'].errors}"
                  >
                  <div *ngIf="submitted && registerForm.controls['username'].errors" class="invalid-feedback">
                    <div *ngIf="registerForm.controls['username'].errors['required']">Username is required</div>
                  </div>
                </div>
                
                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input 
                    type="email" 
                    class="form-control" 
                    id="email" 
                    formControlName="email"
                    [ngClass]="{'is-invalid': submitted && registerForm.controls['email'].errors}"
                  >
                  <div *ngIf="submitted && registerForm.controls['email'].errors" class="invalid-feedback">
                    <div *ngIf="registerForm.controls['email'].errors['required']">Email is required</div>
                    <div *ngIf="registerForm.controls['email'].errors['email']">Please enter a valid email</div>
                  </div>
                </div>
                
                <div class="mb-3">
                  <label for="password" class="form-label">Password</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="password" 
                    formControlName="password"
                    [ngClass]="{'is-invalid': submitted && registerForm.controls['password'].errors}"
                  >
                  <div *ngIf="submitted && registerForm.controls['password'].errors" class="invalid-feedback">
                    <div *ngIf="registerForm.controls['password'].errors['required']">Password is required</div>
                    <div *ngIf="registerForm.controls['password'].errors['minlength']">Password must be at least 6 characters</div>
                  </div>
                </div>
                
                <div *ngIf="error" class="alert alert-danger">
                  {{ error }}
                </div>
                
                <div *ngIf="successMessage" class="alert alert-success">
                  {{ successMessage }}
                </div>
                
                <div class="d-grid gap-2">
                  <button 
                    type="submit" 
                    class="btn btn-primary"
                    [disabled]="loading"
                  >
                    <span *ngIf="loading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    Register
                  </button>
                </div>
                
                <div class="mt-3 text-center">
                  <p>Already have an account? <a routerLink="/login">Login</a></p>
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
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  submitted = false;
  error: string | null = null;
  successMessage: string | null = null;
  
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authStore: AuthStore,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    
    this.authStore.isLoading$.subscribe((loading: boolean) => {
      this.loading = loading;
    });
    
    this.authStore.error$.subscribe((error: string | null) => {
      this.error = error;
      if (error) {
        console.error('Registration error:', error);
      }
    });
    
    this.authStore.isLoggedIn$.subscribe((isLoggedIn: boolean) => {
      if (isLoggedIn) {
        this.router.navigate(['/dashboard']);
      }
    });
  }
  
  onSubmit(): void {
    this.submitted = true;
    this.error = null;
    this.successMessage = null;
    
    if (this.registerForm.invalid) {
      return;
    }
    
    const user: User = {
      username: this.registerForm.value.username,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password
    };
    
    console.log('Submitting registration:', user);
    
    this.loading = true;
    
    this.authService.register(user)
      .pipe(
        tap(response => {
          console.log('Registration successful:', response);
          this.loading = false;
          
          // Handle different response formats
          if (typeof response === 'object' && response !== null) {
            this.successMessage = response.message || 'Registration successful!';
          } else if (typeof response === 'string') {
            this.successMessage = response;
          } else {
            this.successMessage = 'Registration successful!';
          }
          
          // Redirect to login page after a short delay
          setTimeout(() => {
            this.router.navigate(['/login'], { queryParams: { registered: 'true' } });
          }, 1500);
        }),
        catchError(err => {
          console.error('Registration error details:', err);
          console.error('Status:', err.status);
          console.error('Status Text:', err.statusText);
          console.error('Error body:', err.error);
          
          this.loading = false;
          
          // Special case: if status is 200 but we're in the error handler, it's likely a success
          if (err.status === 200) {
            this.successMessage = 'Registration successful!';
            
            // Redirect to login page after a short delay
            setTimeout(() => {
              this.router.navigate(['/login'], { queryParams: { registered: 'true' } });
            }, 1500);
          } else {
            // Handle different error formats
            if (typeof err.error === 'object' && err.error !== null) {
              this.error = err.error.message || 'Registration failed';
            } else if (typeof err.error === 'string') {
              // Check if the error message actually indicates success
              if (err.error.includes('success') || err.error.includes('registered')) {
                this.successMessage = err.error;
                
                // Redirect to login page after a short delay
                setTimeout(() => {
                  this.router.navigate(['/login'], { queryParams: { registered: 'true' } });
                }, 1500);
              } else {
                this.error = err.error;
              }
            } else {
              this.error = 'Registration failed';
            }
          }
          
          return of(null);
        })
      )
      .subscribe();
  }
} 