import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '../models/category.model';
import { environment } from '../../environments/environment';

// Fix the API URL to avoid duplicate /api
const API_URL = environment.apiUrl + '/categories';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private http: HttpClient) { }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(API_URL);
  }

  getCategory(id: number): Observable<Category> {
    return this.http.get<Category>(`${API_URL}/${id}`);
  }

  createCategory(category: Category): Observable<Category> {
    return this.http.post<Category>(API_URL, category);
  }

  updateCategory(id: number, category: Category): Observable<Category> {
    return this.http.put<Category>(`${API_URL}/${id}`, category);
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/${id}`);
  }
} 