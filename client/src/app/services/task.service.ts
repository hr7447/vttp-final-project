import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Task } from '../models/task.model';
import { environment } from '../../environments/environment';

// Fix the API URL to avoid duplicate /api
const API_URL = environment.apiUrl + '/tasks';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private http: HttpClient) {
    console.log('Task API URL:', API_URL);
  }

  getTasks(): Observable<Task[]> {
    console.log('Getting all tasks');
    return this.http.get<Task[]>(API_URL).pipe(
      tap(tasks => console.log(`Retrieved ${tasks.length} tasks`))
    );
  }

  getSharedTasks(): Observable<Task[]> {
    console.log('Getting shared tasks');
    return this.http.get<Task[]>(`${API_URL}/shared`).pipe(
      tap(tasks => console.log(`Retrieved ${tasks.length} shared tasks`))
    );
  }

  getTasksByCategory(categoryId: number): Observable<Task[]> {
    console.log(`Getting tasks for category ${categoryId}`);
    return this.http.get<Task[]>(`${API_URL}/category/${categoryId}`).pipe(
      tap(tasks => console.log(`Retrieved ${tasks.length} tasks for category ${categoryId}`))
    );
  }

  getTask(id: number): Observable<Task> {
    console.log(`Getting task ${id}`);
    return this.http.get<Task>(`${API_URL}/${id}`).pipe(
      tap(task => console.log(`Retrieved task: ${task.title}`))
    );
  }

  createTask(task: Task): Observable<Task> {
    console.log('Creating task:', task);
    return this.http.post<Task>(API_URL, task).pipe(
      tap(newTask => console.log(`Created task with ID: ${newTask.id}`))
    );
  }

  updateTask(id: number, task: Task): Observable<Task> {
    console.log(`Updating task ${id}:`, task);
    return this.http.put<Task>(`${API_URL}/${id}`, task).pipe(
      tap(updatedTask => console.log(`Updated task with ID: ${updatedTask.id}`))
    );
  }
  
  updateSharedTask(id: number, task: Task): Observable<Task> {
    console.log(`Updating shared task ${id}:`, task);
    return this.http.put<Task>(`${API_URL}/shared/${id}`, task).pipe(
      tap(updatedTask => console.log(`Updated shared task with ID: ${updatedTask.id}`))
    );
  }

  updateSharedTaskStatus(id: number, status: string): Observable<any> {
    console.log(`Updating shared task status ${id} to ${status}`);
    return this.http.put(`${API_URL}/shared/${id}/status-update?status=${status}`, {}).pipe(
      tap(response => console.log(`Updated shared task status: ${id}`, response))
    );
  }

  deleteTask(id: number): Observable<any> {
    console.log(`Deleting task ${id}`);
    // Use the original endpoint
    return this.http.delete(`${API_URL}/${id}`).pipe(
      tap(response => console.log(`Deleted task with ID: ${id}`, response))
    );
  }
  
  shareTask(taskId: number, username: string, permission: string = 'VIEW'): Observable<any> {
    console.log(`Sharing task ${taskId} with user ${username} (permission: ${permission})`);
    return this.http.post(`${environment.apiUrl}/shares/task/${taskId}/username/${username}?permission=${permission}`, {}).pipe(
      tap(response => console.log(`Shared task with ID: ${taskId}`, response))
    );
  }
} 