import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TaskStore } from '../../stores/task.store';
import { CategoryStore } from '../../stores/category.store';
import { Task, TaskStatus } from '../../models/task.model';
import { Category } from '../../models/category.model';
import { TaskService } from '../../services/task.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-shared-tasks',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Shared Tasks</h2>
      </div>
      
      <div *ngIf="loading" class="text-center my-5">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      
      <div *ngIf="!loading && sharedTasks.length === 0" class="text-center my-5">
        <p class="text-muted">No shared tasks found.</p>
        <p>Tasks shared with you by other users will appear here.</p>
      </div>
      
      <div *ngIf="error" class="alert alert-danger">
        {{ error }}
      </div>
      
      <div class="list-group" *ngIf="!loading && sharedTasks.length > 0">
        <div *ngFor="let task of sharedTasks" 
             class="list-group-item list-group-item-action">
          <div class="d-flex w-100 justify-content-between align-items-center">
            <div>
              <div class="d-flex align-items-center">
                <span class="badge bg-secondary me-2">Shared</span>
                <h5 class="mb-1" [ngClass]="{'text-decoration-line-through': task.status === TaskStatus.DONE}">
                  {{ task.title }}
                </h5>
              </div>
              <p class="mb-1">{{ task.description }}</p>
              <div class="d-flex align-items-center">
                <small class="me-2" [ngClass]="{
                  'text-primary': task.status === TaskStatus.IN_PROGRESS,
                  'text-success': task.status === TaskStatus.DONE,
                  'text-secondary': task.status === TaskStatus.TODO
                }">{{ task.status }}</small>
                
                <!-- Display category with its color if available -->
                <span *ngIf="task.categoryId" class="badge me-2" 
                      [ngStyle]="getCategoryStyle(task.categoryId)">
                  {{ getCategoryName(task) }}
                </span>
                
                <small *ngIf="task.dueDate" class="text-danger">
                  Due: {{ task.dueDate | date:'mediumDate' }}
                </small>
                
                <small class="ms-2 text-muted">
                  Shared by: {{ task.ownerUsername || 'Unknown' }}
                </small>
              </div>
            </div>
            
            <div class="btn-group">
              <button 
                (click)="toggleTaskStatus(task)" 
                class="btn btn-sm" 
                [ngClass]="{
                  'btn-outline-success': task.status !== TaskStatus.DONE,
                  'btn-outline-secondary': task.status === TaskStatus.DONE
                }"
                [disabled]="updatingTaskId === task.id"
              >
                <span *ngIf="updatingTaskId === task.id" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                <i *ngIf="updatingTaskId !== task.id" class="bi" [ngClass]="{
                  'bi-check-circle': task.status !== TaskStatus.DONE,
                  'bi-arrow-counterclockwise': task.status === TaskStatus.DONE
                }"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class SharedTasksComponent implements OnInit {
  sharedTasks: Task[] = [];
  categories: Category[] = [];
  loading = true;
  error: string | null = null;
  updatingTaskId: number | null = null;
  
  TaskStatus = TaskStatus; // Make enum available to template
  
  constructor(
    private taskStore: TaskStore,
    private categoryStore: CategoryStore,
    private taskService: TaskService
  ) {}
  
  ngOnInit(): void {
    this.loadSharedTasks();
    this.categoryStore.loadCategories();
    
    this.taskStore.isLoading$.subscribe((loading: boolean) => {
      this.loading = loading;
    });
    
    this.taskStore.error$.subscribe((error: string | null) => {
      this.error = error;
      this.updatingTaskId = null; // Reset updating state on error
    });
    
    this.categoryStore.categories$.subscribe((categories: Category[]) => {
      this.categories = categories;
    });
  }
  
  loadSharedTasks(): void {
    this.taskStore.loadSharedTasks();
    this.taskStore.sharedTasks$.subscribe((tasks: Task[]) => {
      this.sharedTasks = tasks;
    });
  }
  
  getCategoryName(task: Task): string | null {
    if (!task.categoryId) return null;
    
    if (task.categoryName) return task.categoryName;
    
    const category = this.categories.find(c => c.id === task.categoryId);
    return category ? category.name : null;
  }
  
  getCategoryStyle(categoryId: number): { [key: string]: string } {
    const category = this.categories.find(c => c.id === categoryId);
    
    if (category && category.color) {
      return {
        'background-color': category.color,
        'color': this.getContrastColor(category.color)
      };
    }
    
    // Default style if category not found or has no color
    return {
      'background-color': '#17a2b8',  // Default bootstrap info color
      'color': '#fff'
    };
  }
  
  // Helper method to determine if text should be white or black based on background color
  getContrastColor(hexColor: string): string {
    // Remove the hash if it exists
    hexColor = hexColor.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);
    
    // Calculate luminance - weights are based on human perception
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black for bright colors, white for dark colors
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }
  
  toggleTaskStatus(task: Task): void {
    if (!task.id) {
      console.error('Cannot update task without ID');
      this.error = 'Cannot update task: Missing task ID';
      return;
    }
    
    console.log('Toggling task status for:', task);
    this.error = null;
    this.updatingTaskId = task.id;
    
    const newStatus = task.status === TaskStatus.DONE ? TaskStatus.TODO : TaskStatus.DONE;
    console.log('New status will be:', newStatus);
    
    // Use the new simpler method that just updates status
    this.taskService.updateSharedTaskStatus(task.id, newStatus)
      .subscribe({
        next: (result) => {
          console.log('Task updated successfully:', result);
          // Update the local list
          this.sharedTasks = this.sharedTasks.map(t => 
            t.id === task.id ? { ...t, status: newStatus } : t
          );
          this.updatingTaskId = null;
        },
        error: (err) => {
          console.error('Error updating shared task:', err);
          this.error = `Error updating task: ${err.message}`;
          // Revert the optimistic update
          this.loadSharedTasks();
          this.updatingTaskId = null;
        }
      });
  }
} 