import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Observable, tap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { JwtResponse, LoginRequest } from '../models/auth.model';
import { User } from '../models/user.model';
import { Router } from '@angular/router';

interface AuthState {
  user: any | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoggedIn: false,
  isLoading: false,
  error: null
};

@Injectable()
export class AuthStore extends ComponentStore<AuthState> {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    super(initialState);
    this.initializeState();
  }

  // Selectors
  readonly user$ = this.select(state => state.user);
  readonly isLoggedIn$ = this.select(state => state.isLoggedIn);
  readonly isLoading$ = this.select(state => state.isLoading);
  readonly error$ = this.select(state => state.error);

  // Updaters
  readonly setLoading = this.updater((state, isLoading: boolean) => ({
    ...state,
    isLoading,
    error: isLoading ? null : state.error
  }));

  readonly setError = this.updater((state, error: string | null) => ({
    ...state,
    error,
    isLoading: false
  }));

  readonly setAuthData = this.updater((state, { user, isLoggedIn }: { user: any | null, isLoggedIn: boolean }) => ({
    ...state,
    user,
    isLoggedIn,
    isLoading: false,
    error: null
  }));

  // Effects
  readonly login = this.effect((loginRequest$: Observable<LoginRequest>) => {
    return loginRequest$.pipe(
      tap(() => this.setLoading(true)),
      tap(request => {
        this.authService.login(request).subscribe({
          next: (response: JwtResponse) => {
            this.authService.saveToken(response.token);
            this.authService.saveUser(response);
            this.setAuthData({ user: response, isLoggedIn: true });
            this.router.navigate(['/dashboard']);
          },
          error: (err) => {
            this.setError(err.error?.message || 'Login failed');
          }
        });
      })
    );
  });

  readonly register = this.effect((user$: Observable<User>) => {
    return user$.pipe(
      tap(() => this.setLoading(true)),
      tap(user => {
        console.log('Auth store: Registering user', user);
        this.authService.register(user).subscribe({
          next: (response) => {
            console.log('Registration successful:', response);
            this.setLoading(false);
            this.router.navigate(['/login'], { queryParams: { registered: 'true' } });
          },
          error: (err) => {
            console.error('Registration error details:', err);
            this.setError(err.error?.message || 'Registration failed');
          }
        });
      })
    );
  });

  readonly logout = this.effect((trigger$: Observable<void>) => {
    return trigger$.pipe(
      tap(() => {
        this.authService.logout();
        this.setAuthData({ user: null, isLoggedIn: false });
        this.router.navigate(['/login']);
      })
    );
  });

  private initializeState(): void {
    const user = this.authService.getUser();
    const isLoggedIn = this.authService.isLoggedIn();
    this.setAuthData({ user, isLoggedIn });
  }
} 