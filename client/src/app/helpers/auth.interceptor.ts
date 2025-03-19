import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptorFn: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  
  console.log(`Intercepting request to ${req.url}`);
  
  if (token) {
    console.log(`Adding token to request: ${req.url}`);
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(cloned);
  } else {
    console.log(`No token available for request: ${req.url}`);
  }
  
  return next(req);
}; 