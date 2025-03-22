import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { JwtResponse, LoginRequest } from '../models/auth.model';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';

const AUTH_API = environment.apiUrl + '/auth';
const TOKEN_KEY = 'auth-token';
const USER_KEY = 'auth-user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) {
    console.log('Auth API URL:', AUTH_API);
  }

  login(loginRequest: LoginRequest): Observable<JwtResponse> {
    console.log('Login API URL:', `${AUTH_API}/login`);
    return this.http.post<JwtResponse>(`${AUTH_API}/login`, loginRequest);
  }

  register(user: User): Observable<any> {
    console.log('Register API URL:', `${AUTH_API}/register`);
    console.log('Register payload:', user);
    return this.http.post(`${AUTH_API}/register`, user);
  }

  logout(): void {
    console.log('Logging out, clearing storage');
    window.sessionStorage.clear();
  }

  saveToken(token: string): void {
    console.log('Saving token to session storage');
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.setItem(TOKEN_KEY, token);
  }

  getToken(): string | null {
    const token = window.sessionStorage.getItem(TOKEN_KEY);
    console.log('Retrieved token from session storage: ' + (token ? 'Token exists' : 'No token'));
    if (token) {
      try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', tokenData);
        console.log('Token expiration:', new Date(tokenData.exp * 1000).toISOString());
        console.log('Current time:', new Date().toISOString());
        console.log('Token expired:', tokenData.exp * 1000 < Date.now());
      } catch (e) {
        console.error('Error parsing token:', e);
      }
    }
    return token;
  }

  saveUser(user: any): void {
    console.log('Saving user to session storage');
    window.sessionStorage.removeItem(USER_KEY);
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  getUser(): any {
    const user = window.sessionStorage.getItem(USER_KEY);
    if (user) {
      console.log('Retrieved user from session storage');
      return JSON.parse(user);
    }
    console.log('No user found in session storage');
    return null;
  }

  isLoggedIn(): boolean {
    const isLoggedIn = !!this.getToken();
    console.log('Is user logged in:', isLoggedIn);
    return isLoggedIn;
  }
} 