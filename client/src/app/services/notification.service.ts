import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) { }

  sendTaskReminder(taskId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/tasks/${taskId}/remind`, {});
  }
} 