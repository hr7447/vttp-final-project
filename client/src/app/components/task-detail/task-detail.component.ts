import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { TaskStore } from '../../stores/task.store';
import { CategoryStore } from '../../stores/category.store';
import { Task, TaskStatus } from '../../models/task.model';
import { Category } from '../../models/category.model';
import { TaskShareService } from '../../services/task-share.service';
import { Permission } from '../../models/task-share.model';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  template: `
    <div class="container mt-4">
      <div class="row">
        <div class="col-md-8 offset-md-2">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h3>{{ isEditMode ? 'Edit Task' : 'Create New Task' }}</h3>
              <button class="btn btn-outline-secondary" (click)="goBack()">
                <i class="bi bi-arrow-left"></i> Back
              </button>
            </div>
            
            <div class="card-body">
              <div *ngIf="loading" class="text-center my-5">
                <div class="spinner-border" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
              
              <form [formGroup]="taskForm" (ngSubmit)="onSubmit()" *ngIf="!loading">
                <div class="mb-3">
                  <label for="title" class="form-label">Title</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="title" 
                    formControlName="title"
                    [ngClass]="{'is-invalid': submitted && taskForm.controls['title'].errors}"
                  >
                  <div *ngIf="submitted && taskForm.controls['title'].errors" class="invalid-feedback">
                    <div *ngIf="taskForm.controls['title'].errors['required']">Title is required</div>
                  </div>
                </div>
                
                <div class="mb-3">
                  <label for="description" class="form-label">Description</label>
                  <textarea 
                    class="form-control" 
                    id="description" 
                    rows="3" 
                    formControlName="description"
                  ></textarea>
                </div>
                
                <div class="mb-3">
                  <label for="dueDate" class="form-label">Due Date</label>
                  <input 
                    type="date" 
                    class="form-control" 
                    id="dueDate" 
                    formControlName="dueDate"
                  >
                </div>
                
                <div class="mb-3">
                  <label for="status" class="form-label">Status</label>
                  <select class="form-select" id="status" formControlName="status">
                    <option [ngValue]="TaskStatus.TODO">To Do</option>
                    <option [ngValue]="TaskStatus.IN_PROGRESS">In Progress</option>
                    <option [ngValue]="TaskStatus.DONE">Done</option>
                  </select>
                </div>
                
                <div class="mb-3">
                  <label for="categoryId" class="form-label">Category</label>
                  <select class="form-select" id="categoryId" formControlName="categoryId">
                    <option [ngValue]="null">No Category</option>
                    <option *ngFor="let category of categories" [ngValue]="category.id">
                      {{ category.name }}
                    </option>
                  </select>
                </div>
                
                <div *ngIf="error" class="alert alert-danger">
                  {{ error }}
                </div>
                
                <div *ngIf="isEditMode && isOwner && taskForm.get('dueDate')?.value" class="mb-3 d-flex justify-content-between align-items-center">
                  <button type="button" class="btn btn-outline-info" (click)="sendReminder()" [disabled]="sendingReminder">
                    <i class="bi bi-envelope me-1"></i>
                    {{ sendingReminder ? 'Sending...' : 'Send Email Reminder' }}
                  </button>
                  
                  <div *ngIf="reminderSent" class="alert alert-success py-1 px-3 mb-0">
                    <i class="bi bi-check-circle me-1"></i> Reminder sent!
                  </div>
                  
                  <div *ngIf="reminderError" class="alert alert-danger py-1 px-3 mb-0">
                    <i class="bi bi-exclamation-circle me-1"></i> {{ reminderError }}
                  </div>
                </div>
                
                <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                  <button 
                    type="button" 
                    class="btn btn-outline-danger me-md-2" 
                    *ngIf="isEditMode"
                    (click)="onDelete()"
                  >
                    Delete
                  </button>
                  <button 
                    type="submit" 
                    class="btn btn-primary"
                    [disabled]="submitting"
                  >
                    <span *ngIf="submitting" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    {{ isEditMode ? 'Update' : 'Create' }} Task
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          <!-- Task Sharing Section (only visible in edit mode) -->
          <div class="card mt-4" *ngIf="isEditMode && taskId">
            <div class="card-header">
              <h5 class="mb-0">Share Task</h5>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <label for="shareUsername" class="form-label">Username to share with</label>
                <div class="input-group">
                  <input 
                    type="text" 
                    class="form-control" 
                    id="shareUsername" 
                    [(ngModel)]="shareUsername"
                    [ngModelOptions]="{standalone: true}"
                    placeholder="Enter username"
                  >
                  <select 
                    class="form-select" 
                    style="max-width: 120px;"
                    [(ngModel)]="sharePermission"
                    [ngModelOptions]="{standalone: true}"
                  >
                    <option [ngValue]="Permission.VIEW">View</option>
                    <option [ngValue]="Permission.EDIT">Edit</option>
                  </select>
                  <button 
                    class="btn btn-outline-primary" 
                    type="button"
                    [disabled]="!shareUsername || sharingInProgress"
                    (click)="shareTask()"
                  >
                    <span *ngIf="sharingInProgress" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    Share
                  </button>
                </div>
                <small class="form-text text-muted">
                  Enter the username of the person you want to share this task with.
                </small>
              </div>
              
              <div *ngIf="shareError" class="alert alert-danger">
                {{ shareError }}
              </div>
              
              <div *ngIf="shareSuccess" class="alert alert-success">
                {{ shareSuccess }}
              </div>
              
              <div *ngIf="taskShares && taskShares.length > 0">
                <h6 class="mt-4">Shared With</h6>
                <ul class="list-group">
                  <li *ngFor="let share of taskShares" class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <span>{{ share.username }}</span>
                      <span class="badge bg-info ms-2">{{ share.permission }}</span>
                    </div>
                    <button 
                      class="btn btn-sm btn-outline-danger"
                      (click)="unshareTask(share.userId)"
                    >
                      <i class="bi bi-x"></i> Remove
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class TaskDetailComponent implements OnInit {
  taskForm!: FormGroup;
  categories: Category[] = [];
  loading = true;
  submitting = false;
  submitted = false;
  isEditMode = false;
  taskId: number | null = null;
  error: string | null = null;
  
  // Task sharing properties
  shareUsername: string = '';
  sharePermission: Permission = Permission.VIEW;
  sharingInProgress = false;
  shareError: string | null = null;
  shareSuccess: string | null = null;
  taskShares: any[] = [];
  
  // Add these properties for the reminder functionality
  sendingReminder = false;
  reminderSent = false;
  reminderError: string | null = null;
  
  TaskStatus = TaskStatus; // Make enum available to template
  Permission = Permission; // Make enum available to template
  
  isOwner = false;
  
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private taskStore: TaskStore,
    private categoryStore: CategoryStore,
    private taskShareService: TaskShareService,
    private notificationService: NotificationService
  ) {}
  
  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
    
    this.taskStore.error$.subscribe((error: string | null) => {
      this.error = error;
      this.submitting = false;
    });
    
    this.taskStore.isLoading$.subscribe((loading: boolean) => {
      this.loading = loading;
    });
    
    this.route.params.subscribe(params => {
      if (params['id'] && params['id'] !== 'new') {
        this.isEditMode = true;
        this.taskId = +params['id'];
        this.loadTask(this.taskId);
        this.loadTaskShares(this.taskId);
      } else {
        this.loading = false;
      }
    });
  }
  
  initForm(): void {
    this.taskForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: [''],
      dueDate: [null],
      status: [TaskStatus.TODO],
      categoryId: [null]
    });
  }
  
  loadCategories(): void {
    this.categoryStore.loadCategories();
    this.categoryStore.categories$.subscribe((categories: Category[]) => {
      this.categories = categories;
    });
  }
  
  loadTask(id: number): void {
    this.taskStore.loadTask(id);
    this.taskStore.selectedTask$.subscribe((task: Task | null) => {
      if (task) {
        this.patchFormValues(task);
        this.isOwner = this.checkIfUserIsOwner(task);
        this.loading = false;
      }
    });
  }
  
  loadTaskShares(taskId: number): void {
    this.taskShareService.getSharesByTask(taskId).subscribe({
      next: (shares) => {
        this.taskShares = shares;
      },
      error: (error) => {
        console.error('Error loading task shares:', error);
      }
    });
  }
  
  patchFormValues(task: Task): void {
    // Format the date to YYYY-MM-DD for the date input
    let formattedDueDate = null;
    if (task.dueDate) {
      const date = new Date(task.dueDate);
      formattedDueDate = date.toISOString().split('T')[0];
    }
    
    this.taskForm.patchValue({
      title: task.title,
      description: task.description,
      dueDate: formattedDueDate,
      status: task.status,
      categoryId: task.categoryId
    });
  }
  
  onSubmit(): void {
    this.submitted = true;
    
    if (this.taskForm.invalid) {
      return;
    }
    
    this.submitting = true;
    this.error = null;
    
    const formData = this.taskForm.value;
    
    // Convert date string to Date object if present
    if (formData.dueDate) {
      formData.dueDate = new Date(formData.dueDate);
    }
    
    const taskData: Task = {
      ...formData
    };
    
    console.log('Submitting task data:', taskData);
    
    if (this.isEditMode && this.taskId) {
      console.log(`Updating task with ID: ${this.taskId}`);
      this.taskStore.updateTask({
        id: this.taskId,
        task: taskData
      });
      
      // Navigate back after successful update
      this.taskStore.error$.subscribe((error: string | null) => {
        if (error) {
          console.error('Error updating task:', error);
          this.error = error;
          this.submitting = false;
        } else {
          setTimeout(() => {
            if (!this.error) {
              this.router.navigate(['/tasks']);
            }
          }, 500);
        }
      });
    } else {
      console.log('Creating new task');
      this.taskStore.createTask(taskData);
      
      // Navigate back after successful creation
      this.taskStore.error$.subscribe((error: string | null) => {
        if (error) {
          console.error('Error creating task:', error);
          this.error = error;
          this.submitting = false;
        } else {
          setTimeout(() => {
            if (!this.error) {
              this.router.navigate(['/tasks']);
            }
          }, 500);
        }
      });
    }
  }
  
  onDelete(): void {
    if (this.taskId && confirm('Are you sure you want to delete this task?')) {
      console.log(`Deleting task with ID: ${this.taskId}`);
      this.error = null;
      this.submitting = true;
      
      this.taskStore.deleteTask(this.taskId);
      
      // Navigate back after successful deletion
      this.taskStore.error$.subscribe((error: string | null) => {
        if (error) {
          console.error('Error deleting task:', error);
          this.error = error;
          this.submitting = false;
        } else {
          setTimeout(() => {
            if (!this.error) {
              this.router.navigate(['/tasks']);
            }
          }, 500);
        }
      });
    }
  }
  
  shareTask(): void {
    if (!this.shareUsername || !this.taskId) {
      return;
    }
    
    this.sharingInProgress = true;
    this.shareError = null;
    this.shareSuccess = null;
    
    // Use the shareTaskByUsername method
    this.taskShareService.shareTaskByUsername(this.taskId, this.shareUsername, this.sharePermission).subscribe({
      next: (response) => {
        this.sharingInProgress = false;
        this.shareSuccess = `Task shared successfully with ${this.shareUsername}`;
        this.shareUsername = '';
        this.loadTaskShares(this.taskId!);
      },
      error: (error) => {
        this.sharingInProgress = false;
        this.shareError = error.error?.message || 'Failed to share task. User may not exist.';
        console.error('Error sharing task:', error);
      }
    });
  }
  
  unshareTask(userId: number): void {
    if (!this.taskId) return;
    
    // First, find the username from the task shares for better error messages
    const shareToRemove = this.taskShares.find(share => share.userId === userId);
    const username = shareToRemove ? shareToRemove.username : 'user';
    
    this.shareError = null;
    this.shareSuccess = null;
    this.sharingInProgress = true;
    
    // Use username-based unshare instead of user ID-based unshare
    this.taskShareService.unshareTaskByUsername(this.taskId, username).subscribe({
      next: () => {
        this.sharingInProgress = false;
        this.shareSuccess = `Task sharing with ${username} removed successfully`;
        this.loadTaskShares(this.taskId!);
        
        // Workaround: Force refresh the task shares after a short delay
        setTimeout(() => {
          this.loadTaskShares(this.taskId!);
        }, 500);
      },
      error: (error) => {
        this.sharingInProgress = false;
        console.error('Error unsharing task:', error);
        this.shareError = `Failed to remove sharing with ${username}: ${error.message || 'Unknown error'}`;
        
        // Even if we got an error, the operation might have succeeded on the server
        // Try refreshing the shares list after a short delay
        setTimeout(() => {
          this.loadTaskShares(this.taskId!);
        }, 1000);
      }
    });
  }
  
  goBack(): void {
    this.router.navigate(['/tasks']);
  }
  
  sendReminder(): void {
    if (!this.taskId) return;
    
    this.sendingReminder = true;
    this.reminderSent = false;
    this.reminderError = null;
    
    this.notificationService.sendTaskReminder(this.taskId).subscribe({
      next: () => {
        this.sendingReminder = false;
        this.reminderSent = true;
        
        setTimeout(() => {
          this.reminderSent = false;
        }, 3000);
      },
      error: (err) => {
        this.sendingReminder = false;
        this.reminderError = 'Failed to send reminder';
        console.error('Error sending reminder:', err);
        
        setTimeout(() => {
          this.reminderError = null;
        }, 3000);
      }
    });
  }
  
  checkIfUserIsOwner(task: Task): boolean {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return task.ownerId === user.id;
  }
} 