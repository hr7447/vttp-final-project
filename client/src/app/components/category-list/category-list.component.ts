import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryStore } from '../../stores/category.store';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container mt-4">
      <div class="row">
        <div class="col-md-4">
          <div class="card">
            <div class="card-header">
              <h3>{{ editMode ? 'Edit Category' : 'Add Category' }}</h3>
            </div>
            <div class="card-body">
              <form [formGroup]="categoryForm" (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label for="name" class="form-label">Name</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="name" 
                    formControlName="name"
                    [ngClass]="{'is-invalid': submitted && categoryForm.controls['name'].errors}"
                  >
                  <div *ngIf="submitted && categoryForm.controls['name'].errors" class="invalid-feedback">
                    <div *ngIf="categoryForm.controls['name'].errors['required']">Name is required</div>
                  </div>
                </div>
                
                <div class="mb-3">
                  <label for="color" class="form-label">Color</label>
                  <input 
                    type="color" 
                    class="form-control form-control-color" 
                    id="color" 
                    formControlName="color"
                    title="Choose category color"
                  >
                </div>
                
                <div *ngIf="error" class="alert alert-danger">
                  {{ error }}
                </div>
                
                <div class="d-grid gap-2">
                  <button 
                    type="submit" 
                    class="btn btn-primary"
                    [disabled]="submitting"
                  >
                    <span *ngIf="submitting" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    {{ editMode ? 'Update' : 'Add' }} Category
                  </button>
                  
                  <button 
                    *ngIf="editMode" 
                    type="button" 
                    class="btn btn-outline-secondary"
                    (click)="cancelEdit()"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        <div class="col-md-8">
          <div class="card">
            <div class="card-header">
              <h3>Categories</h3>
            </div>
            <div class="card-body">
              <div *ngIf="loading" class="text-center my-5">
                <div class="spinner-border" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
              
              <div *ngIf="!loading && categories.length === 0" class="text-center my-5">
                <p class="text-muted">No categories found. Create a new category to get started!</p>
              </div>
              
              <ul class="list-group" *ngIf="!loading && categories.length > 0">
                <li *ngFor="let category of categories" class="list-group-item d-flex justify-content-between align-items-center">
                  <div class="d-flex align-items-center">
                    <span 
                      class="color-swatch me-2" 
                      [style.backgroundColor]="category.color || '#6c757d'"
                    ></span>
                    <span>{{ category.name }}</span>
                  </div>
                  
                  <div class="btn-group">
                    <button 
                      class="btn btn-sm btn-outline-primary" 
                      (click)="editCategory(category)"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button 
                      class="btn btn-sm btn-outline-danger" 
                      (click)="deleteCategory(category)"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </li>
              </ul>
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
      border-radius: 4px;
      display: inline-block;
    }
  `]
})
export class CategoryListComponent implements OnInit {
  categoryForm!: FormGroup;
  categories: Category[] = [];
  loading = true;
  submitting = false;
  submitted = false;
  editMode = false;
  currentCategoryId: number | null = null;
  error: string | null = null;
  
  constructor(
    private formBuilder: FormBuilder,
    private categoryStore: CategoryStore
  ) {}
  
  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
    
    this.categoryStore.isLoading$.subscribe((loading: boolean) => {
      this.loading = loading;
    });
    
    this.categoryStore.error$.subscribe((error: string | null) => {
      this.error = error;
      this.submitting = false;
    });
  }
  
  initForm(): void {
    this.categoryForm = this.formBuilder.group({
      name: ['', Validators.required],
      color: ['#6c757d']
    });
  }
  
  loadCategories(): void {
    this.categoryStore.loadCategories();
    this.categoryStore.categories$.subscribe((categories: Category[]) => {
      this.categories = categories;
    });
  }
  
  onSubmit(): void {
    this.submitted = true;
    
    if (this.categoryForm.invalid) {
      return;
    }
    
    this.submitting = true;
    
    const categoryData: Category = {
      ...this.categoryForm.value
    };
    
    if (this.editMode && this.currentCategoryId) {
      this.categoryStore.updateCategory({
        id: this.currentCategoryId,
        category: categoryData
      });
      
      // Reset form after a delay to allow for the update to complete
      setTimeout(() => {
        if (!this.error) {
          this.resetForm();
          this.submitting = false;
        }
      }, 500);
    } else {
      this.categoryStore.createCategory(categoryData);
      
      // Reset form after a delay to allow for the creation to complete
      setTimeout(() => {
        if (!this.error) {
          this.resetForm();
          this.submitting = false;
        }
      }, 500);
    }
  }
  
  editCategory(category: Category): void {
    this.editMode = true;
    this.currentCategoryId = category.id || null;
    
    this.categoryForm.patchValue({
      name: category.name,
      color: category.color || '#6c757d'
    });
  }
  
  deleteCategory(category: Category): void {
    if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
      if (category.id) {
        this.categoryStore.deleteCategory(category.id);
      }
    }
  }
  
  cancelEdit(): void {
    this.resetForm();
  }
  
  resetForm(): void {
    this.editMode = false;
    this.currentCategoryId = null;
    this.submitted = false;
    
    this.categoryForm.reset({
      name: '',
      color: '#6c757d'
    });
  }
} 