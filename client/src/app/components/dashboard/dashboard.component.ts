import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TaskStore } from '../../stores/task.store';
import { CategoryStore } from '../../stores/category.store';
import { QuoteService } from '../../services/quote.service';
import { Task, TaskStatus } from '../../models/task.model';
import { Category } from '../../models/category.model';
import { Quote } from '../../models/quote.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mt-4">
      <div class="row mb-4">
        <div class="col-md-12">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h1 class="fw-bold">Dashboard</h1>
              <p class="lead text-muted">Welcome back! Here's an overview of your tasks.</p>
            </div>
            <a routerLink="/tasks/new" class="btn btn-primary">
              <i class="bi bi-plus-lg me-1"></i> New Task
            </a>
          </div>
        </div>
      </div>
      
      <div class="row mb-4">
        <div class="col-md-4">
          <div class="card bg-light h-100">
            <div class="card-body text-center py-4">
              <div class="mb-3">
                <span class="badge rounded-pill text-bg-secondary fs-6 px-3 py-2">
                  <i class="bi bi-hourglass me-1"></i> To Do
                </span>
              </div>
              <p class="display-4 mb-0 fw-bold">{{ todoCount }}</p>
              <div class="mt-2 text-muted small">
                <span class="me-2"><i class="bi bi-person me-1"></i>{{ ownedTodoCount }}</span>
                <span><i class="bi bi-people me-1"></i>{{ sharedTodoCount }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-md-4">
          <div class="card bg-light h-100">
            <div class="card-body text-center py-4">
              <div class="mb-3">
                <span class="badge rounded-pill text-bg-primary fs-6 px-3 py-2">
                  <i class="bi bi-arrow-clockwise me-1"></i> In Progress
                </span>
              </div>
              <p class="display-4 mb-0 fw-bold">{{ inProgressCount }}</p>
              <div class="mt-2 text-muted small">
                <span class="me-2"><i class="bi bi-person me-1"></i>{{ ownedInProgressCount }}</span>
                <span><i class="bi bi-people me-1"></i>{{ sharedInProgressCount }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-md-4">
          <div class="card bg-light h-100">
            <div class="card-body text-center py-4">
              <div class="mb-3">
                <span class="badge rounded-pill text-bg-success fs-6 px-3 py-2">
                  <i class="bi bi-check-circle me-1"></i> Completed
                </span>
              </div>
              <p class="display-4 mb-0 fw-bold">{{ completedCount }}</p>
              <div class="mt-2 text-muted small">
                <span class="me-2"><i class="bi bi-person me-1"></i>{{ ownedCompletedCount }}</span>
                <span><i class="bi bi-people me-1"></i>{{ sharedCompletedCount }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="row">
        <div class="col-md-6">
          <div class="card mb-4 h-100">
            <div class="card-header bg-white d-flex justify-content-between align-items-center py-3">
              <h5 class="mb-0 fw-bold">
                <i class="bi bi-clock-history me-1 text-primary"></i> Recent Tasks
                <span class="ms-2 small fw-normal text-muted">(Own & Shared)</span>
              </h5>
              <a routerLink="/tasks" class="btn btn-sm btn-outline-primary">
                <i class="bi bi-list me-1"></i> View All
              </a>
            </div>
            <div class="card-body">
              <div *ngIf="loading" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
              
              <div *ngIf="!loading && recentTasks.length === 0" class="text-center py-4">
                <div class="text-muted">
                  <i class="bi bi-inbox display-4 d-block mb-3 opacity-50"></i>
                  <p>No tasks found. Create a new task to get started.</p>
                  <a routerLink="/tasks/new" class="btn btn-sm btn-primary">
                    <i class="bi bi-plus-lg me-1"></i> Create Task
                  </a>
                </div>
              </div>
              
              <ul class="list-group list-group-flush" *ngIf="!loading && recentTasks.length > 0">
                <li *ngFor="let task of recentTasks" class="list-group-item py-3 border-0 border-bottom">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <span [ngClass]="{
                        'text-decoration-line-through text-muted': task.status === TaskStatus.DONE,
                        'fw-bold': task.status === TaskStatus.TODO,
                        'fw-medium': task.status === TaskStatus.IN_PROGRESS
                      }">{{ task.title }}</span>
                      <span class="ms-2 badge rounded-pill" [ngClass]="{
                        'text-bg-secondary': task.status === TaskStatus.TODO,
                        'text-bg-primary': task.status === TaskStatus.IN_PROGRESS,
                        'text-bg-success': task.status === TaskStatus.DONE
                      }">{{ task.status }}</span>
                      <span *ngIf="isSharedTask(task)" class="ms-2 badge rounded-pill text-bg-info">
                        <i class="bi bi-share me-1"></i> Shared
                      </span>
                    </div>
                    <a [routerLink]="['/tasks', task.id]" class="btn btn-sm btn-outline-secondary rounded-circle">
                      <i class="bi bi-pencil"></i>
                    </a>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="col-md-6">
          <div class="card mb-4">
            <div class="card-header bg-white d-flex justify-content-between align-items-center py-3">
              <h5 class="mb-0 fw-bold">
                <i class="bi bi-tag me-1 text-primary"></i> Categories
              </h5>
              <a routerLink="/categories" class="btn btn-sm btn-outline-primary">
                <i class="bi bi-gear me-1"></i> Manage
              </a>
            </div>
            <div class="card-body">
              <div *ngIf="loading" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
              
              <div *ngIf="!loading && categories.length === 0" class="text-center py-4">
                <div class="text-muted">
                  <i class="bi bi-tags display-4 d-block mb-3 opacity-50"></i>
                  <p>No categories found. Create categories to organize your tasks.</p>
                  <a routerLink="/categories" class="btn btn-sm btn-primary">
                    <i class="bi bi-plus-lg me-1"></i> Create Category
                  </a>
                </div>
              </div>
              
              <div class="row" *ngIf="!loading && categories.length > 0">
                <div *ngFor="let category of categories" class="col-md-6 mb-2">
                  <div class="card border-0 bg-light">
                    <div class="card-body py-2 d-flex align-items-center">
                      <span 
                        class="color-swatch me-2" 
                        [style.backgroundColor]="category.color || '#6c757d'"
                      ></span>
                      <span class="fw-medium">{{ category.name }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="card">
            <div class="card-header bg-white py-3">
              <h5 class="mb-0 fw-bold">
                <i class="bi bi-quote me-1 text-primary"></i> Quote of the Day
              </h5>
            </div>
            <div class="card-body">
              <div *ngIf="quoteLoading" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
              <blockquote class="blockquote mb-0 py-2" *ngIf="!quoteLoading">
                <p class="fs-5 fst-italic text-muted">
                  <i class="bi bi-quote fs-3 text-primary opacity-50 me-1"></i>
                  {{ quote.content }}
                </p>
                <footer class="blockquote-footer mt-2">{{ quote.author }}</footer>
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .color-swatch {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: inline-block;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .card {
      overflow: hidden;
    }
    
    .display-4 {
      font-size: 3rem;
    }
    
    .bg-light {
      background-color: #f8f9fa !important;
    }
    
    .list-group-item:last-child {
      border-bottom: 0 !important;
    }
  `]
})
export class DashboardComponent implements OnInit {
  tasks: Task[] = [];
  sharedTasks: Task[] = [];
  categories: Category[] = [];
  recentTasks: Task[] = [];
  loading = true;
  quoteLoading = true;
  
  quote: Quote = { 
    id: '',
    content: 'The only way to do great work is to love what you do.', 
    author: 'Steve Jobs' 
  };
  
  TaskStatus = TaskStatus; // Make enum available to template
  
  constructor(
    private taskStore: TaskStore,
    private categoryStore: CategoryStore,
    private quoteService: QuoteService
  ) {}
  
  ngOnInit(): void {
    this.loadData();
  }
  
  loadData(): void {
    this.taskStore.loadTasks();
    this.taskStore.loadSharedTasks();
    this.categoryStore.loadCategories();
    this.loadQuote();
    
    this.taskStore.tasks$.subscribe((tasks: Task[]) => {
      this.tasks = tasks;
      this.updateRecentTasks();
    });
    
    this.taskStore.sharedTasks$.subscribe((tasks: Task[]) => {
      this.sharedTasks = tasks;
      this.updateRecentTasks();
    });
    
    this.categoryStore.categories$.subscribe((categories: Category[]) => {
      this.categories = categories;
    });
  }
  
  updateRecentTasks(): void {
    // Only update when we have both regular and shared tasks
    if (this.tasks && this.sharedTasks) {
      this.recentTasks = this.getRecentTasks();
      this.loading = false;
    }
  }
  
  loadQuote(): void {
    this.quoteLoading = true;
    this.quoteService.getRandomQuote(new Date().getTime()).subscribe({
      next: (quote: Quote) => {
        console.log('Received quote:', quote);
        this.quote = quote;
        this.quoteLoading = false;
      },
      error: (error) => {
        console.error('Error loading quote:', error);
        this.quoteLoading = false;
      }
    });
  }
  
  get allTasks(): Task[] {
    return [...this.tasks, ...this.sharedTasks];
  }
  
  get todoCount(): number {
    return this.allTasks.filter(task => task.status === TaskStatus.TODO).length;
  }
  
  get ownedTodoCount(): number {
    return this.tasks.filter(task => task.status === TaskStatus.TODO).length;
  }
  
  get sharedTodoCount(): number {
    return this.sharedTasks.filter(task => task.status === TaskStatus.TODO).length;
  }
  
  get inProgressCount(): number {
    return this.allTasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length;
  }
  
  get ownedInProgressCount(): number {
    return this.tasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length;
  }
  
  get sharedInProgressCount(): number {
    return this.sharedTasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length;
  }
  
  get completedCount(): number {
    return this.allTasks.filter(task => task.status === TaskStatus.DONE).length;
  }
  
  get ownedCompletedCount(): number {
    return this.tasks.filter(task => task.status === TaskStatus.DONE).length;
  }
  
  get sharedCompletedCount(): number {
    return this.sharedTasks.filter(task => task.status === TaskStatus.DONE).length;
  }
  
  getRecentTasks(): Task[] {
    // Get the 5 most recently created tasks combining own and shared tasks
    return [...this.tasks, ...this.sharedTasks]
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 5);
  }
  
  isSharedTask(task: Task): boolean {
    return this.sharedTasks.some(t => t.id === task.id);
  }
} 