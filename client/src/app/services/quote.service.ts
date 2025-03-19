import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Quote } from '../models/quote.model';
import { environment } from '../../environments/environment';

// Fix the API URL to avoid duplicate /api
const API_URL = environment.apiUrl + '/quotes';

@Injectable({
  providedIn: 'root'
})
export class QuoteService {

  constructor(private http: HttpClient) { }

  getRandomQuote(timestamp?: number): Observable<Quote> {
    // Add a timestamp parameter to prevent caching
    let params = new HttpParams();
    if (timestamp) {
      params = params.set('_t', timestamp.toString());
      // Always force refresh from API
      params = params.set('refresh', 'true');
    }
    
    return this.http.get<Quote>(`${API_URL}/random`, { params });
  }
} 