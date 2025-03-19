import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { TaskShare, Permission } from '../models/task-share.model';
import { environment } from '../../environments/environment';

// Fix the API URL to avoid duplicate /api
const API_URL = environment.apiUrl + '/shares';

@Injectable({
  providedIn: 'root'
})
export class TaskShareService {

  constructor(private http: HttpClient) { }

  getSharesByTask(taskId: number): Observable<TaskShare[]> {
    return this.http.get<TaskShare[]>(`${API_URL}/task/${taskId}`);
  }

  getSharesByUser(): Observable<TaskShare[]> {
    return this.http.get<TaskShare[]>(`${API_URL}/user`);
  }

  shareTask(taskId: number, userId: number, permission: Permission = Permission.VIEW): Observable<TaskShare> {
    return this.http.post<TaskShare>(`${API_URL}/task/${taskId}/user/${userId}?permission=${permission}`, {});
  }
  
  shareTaskByUsername(taskId: number, username: string, permission: Permission = Permission.VIEW): Observable<TaskShare> {
    return this.http.post<TaskShare>(`${API_URL}/task/${taskId}/username/${username}?permission=${permission}`, {});
  }

  updateSharePermission(shareId: number, permission: Permission): Observable<TaskShare> {
    return this.http.put<TaskShare>(`${API_URL}/${shareId}?permission=${permission}`, {});
  }

  unshareTask(taskId: number, userId: number): Observable<any> {
    console.log(`Unsharing task ${taskId} from user ${userId}`);
    return this.http.delete(`${API_URL}/task/${taskId}/user/${userId}`)
      .pipe(
        tap(response => console.log('Unshare successful:', response)),
        catchError(error => {
          console.error('Error unsharing task:', error);
          return throwError(() => new Error('Failed to remove sharing: ' + (error.error?.message || error.message || 'Unknown error')));
        })
      );
  }
  
  unshareTaskByUsername(taskId: number, username: string): Observable<any> {
    console.log(`Unsharing task ${taskId} from username ${username}`);
    return this.http.delete(`${API_URL}/task/${taskId}/username/${username}`)
      .pipe(
        tap(response => console.log('Unshare successful:', response)),
        catchError(error => {
          console.error('Error unsharing task by username:', error);
          return throwError(() => new Error('Failed to remove sharing: ' + (error.error?.message || error.message || 'Unknown error')));
        })
      );
  }
} 