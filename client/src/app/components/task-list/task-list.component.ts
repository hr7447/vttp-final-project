import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskStore } from '../../stores/task.store';
import { CategoryStore } from '../../stores/category.store';
import { Task, TaskStatus } from '../../models/task.model';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>My Tasks</h2>
        <a routerLink="/tasks/new" class="btn btn-primary">
          <i class="bi bi-plus-lg"></i> New Task
        </a>
      </div>
      
      <div class="row mb-4">
        <div class="col-md-4">
          <div class="input-group">
            <input 
              type="text" 
              class="form-control" 
              placeholder="Search tasks..." 
              [(ngModel)]="searchTerm"
              (input)="applyFilters()"
            >
            <button class="btn btn-outline-secondary" type="button" (click)="clearSearch()">
              <i class="bi bi-x"></i>
            </button>
          </div>
        </div>
        
        <div class="col-md-3">
          <select class="form-select" [(ngModel)]="statusFilter" (change)="applyFilters()">
            <option value="">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
        </div>
        
        <div class="col-md-3">
          <select class="form-select" [(ngModel)]="categoryFilter" (change)="applyFilters()">
            <option value="">All Categories</option>
            <option *ngFor="let category of categories" [value]="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>
        
        <div class="col-md-2">
          <select class="form-select" [(ngModel)]="sortBy" (change)="applyFilters()">
            <option value="dueDate">Due Date</option>
            <option value="createdAt">Created Date</option>
            <option value="title">Title</option>
          </select>
        </div>
      </div>
      
      <div *ngIf="loading" class="text-center my-5">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      
      <div *ngIf="!loading && filteredTasks.length === 0" class="text-center my-5">
        <p class="text-muted">No tasks found. Create a new task to get started!</p>
      </div>
      
      <div class="list-group" *ngIf="!loading && filteredTasks.length > 0">
        <div *ngFor="let task of filteredTasks" 
             class="list-group-item list-group-item-action">
          <div class="d-flex w-100 justify-content-between align-items-center">
            <div>
              <div class="form-check">
                <input 
                  class="form-check-input" 
                  type="checkbox" 
                  [checked]="task.status === TaskStatus.DONE"
                  (change)="toggleTaskStatus(task)"
                >
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
                
                <span *ngIf="task.categoryId" class="badge me-2" 
                      [ngStyle]="getCategoryStyle(task.categoryId)">
                  {{ getCategoryName(task) }}
                </span>
                
                <small *ngIf="task.dueDate" class="text-danger">
                  Due: {{ task.dueDate | date:'mediumDate' }}
                </small>
              </div>
            </div>
            
            <div class="btn-group">
              <a [routerLink]="['/tasks', task.id]" class="btn btn-sm btn-outline-primary">
                <i class="bi bi-pencil"></i>
              </a>
              <button (click)="deleteTask(task)" class="btn btn-sm btn-outline-danger">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  categories: Category[] = [];
  loading = true;
  
  searchTerm = '';
  statusFilter = '';
  categoryFilter = '';
  sortBy = 'dueDate';
  
  TaskStatus = TaskStatus; // Make enum available to template
  
  constructor(
    private taskStore: TaskStore,
    private categoryStore: CategoryStore
  ) {}
  
  ngOnInit(): void {
    this.taskStore.loadTasks();
    this.categoryStore.loadCategories();
    
    this.taskStore.tasks$.subscribe((tasks: Task[]) => {
      this.tasks = tasks;
      this.applyFilters();
    });
    
    this.categoryStore.categories$.subscribe((categories: Category[]) => {
      this.categories = categories;
    });
    
    this.taskStore.isLoading$.subscribe((loading: boolean) => {
      this.loading = loading;
    });
  }
  
  applyFilters(): void {
    let filtered = [...this.tasks];
    
    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(term) || 
        (task.description && task.description.toLowerCase().includes(term))
      );
    }
    
    // Apply status filter
    if (this.statusFilter) {
      filtered = filtered.filter(task => task.status === this.statusFilter);
    }
    
    // Apply category filter
    if (this.categoryFilter) {
      filtered = filtered.filter(task => task.categoryId === parseInt(this.categoryFilter));
    }
    
    // Apply sorting
    filtered = this.sortTasks(filtered, this.sortBy);
    
    this.filteredTasks = filtered;
  }
  
  sortTasks(tasks: Task[], sortBy: string): Task[] {
    return [...tasks].sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return this.compareDates(a.dueDate, b.dueDate);
        case 'createdAt':
          return this.compareDates(b.createdAt, a.createdAt);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  }
  
  compareDates(dateA: Date | string | undefined, dateB: Date | string | undefined): number {
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;
    
    const timeA = new Date(dateA).getTime();
    const timeB = new Date(dateB).getTime();
    
    return timeA - timeB;
  }
  
  toggleTaskStatus(task: Task): void {
    const newStatus = task.status === TaskStatus.DONE ? TaskStatus.TODO : TaskStatus.DONE;
    
    const updatedTask: Task = {
      ...task,
      status: newStatus
    };
    
    this.taskStore.updateTask({
      id: task.id!,
      task: updatedTask
    });
  }
  
  deleteTask(task: Task): void {
    if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
      this.taskStore.deleteTask(task.id!);
    }
  }
  
  getCategoryName(task: Task): string | null {
    if (!task.categoryId) return null;
    
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
  
  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }
} 