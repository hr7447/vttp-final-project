import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Observable, switchMap, tap } from 'rxjs';
import { CategoryService } from '../services/category.service';
import { Category } from '../models/category.model';

interface CategoryState {
  categories: Category[];
  selectedCategory: Category | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  selectedCategory: null,
  isLoading: false,
  error: null
};

@Injectable()
export class CategoryStore extends ComponentStore<CategoryState> {
  constructor(private categoryService: CategoryService) {
    super(initialState);
  }

  // Selectors
  readonly categories$ = this.select(state => state.categories);
  readonly selectedCategory$ = this.select(state => state.selectedCategory);
  readonly isLoading$ = this.select(state => state.isLoading);
  readonly error$ = this.select(state => state.error);

  // Updaters
  readonly setLoading = this.updater((state, isLoading: boolean) => ({
    ...state,
    isLoading,
    error: isLoading ? null : state.error
  }));

  readonly setError = this.updater((state, error: string | null) => ({
    ...state,
    error,
    isLoading: false
  }));

  readonly setCategories = this.updater((state, categories: Category[]) => ({
    ...state,
    categories,
    isLoading: false
  }));

  readonly setSelectedCategory = this.updater((state, selectedCategory: Category | null) => ({
    ...state,
    selectedCategory,
    isLoading: false
  }));

  readonly addCategory = this.updater((state, category: Category) => ({
    ...state,
    categories: [...state.categories, category],
    isLoading: false
  }));

  readonly updateCategoryInList = this.updater((state, updatedCategory: Category) => ({
    ...state,
    categories: state.categories.map(category => 
      category.id === updatedCategory.id ? updatedCategory : category
    ),
    selectedCategory: state.selectedCategory?.id === updatedCategory.id 
      ? updatedCategory 
      : state.selectedCategory,
    isLoading: false
  }));

  readonly removeCategory = this.updater((state, categoryId: number) => ({
    ...state,
    categories: state.categories.filter(category => category.id !== categoryId),
    selectedCategory: state.selectedCategory?.id === categoryId 
      ? null 
      : state.selectedCategory,
    isLoading: false
  }));

  // Effects
  readonly loadCategories = this.effect((trigger$: Observable<void>) => {
    return trigger$.pipe(
      tap(() => this.setLoading(true)),
      switchMap(() => this.categoryService.getCategories().pipe(
        tap({
          next: (categories) => this.setCategories(categories),
          error: (error) => this.setError(error.message)
        })
      ))
    );
  });

  readonly loadCategory = this.effect((categoryId$: Observable<number>) => {
    return categoryId$.pipe(
      tap(() => this.setLoading(true)),
      switchMap((categoryId) => this.categoryService.getCategory(categoryId).pipe(
        tap({
          next: (category) => this.setSelectedCategory(category),
          error: (error) => this.setError(error.message)
        })
      ))
    );
  });

  readonly createCategory = this.effect((category$: Observable<Category>) => {
    return category$.pipe(
      tap(() => this.setLoading(true)),
      switchMap((category) => this.categoryService.createCategory(category).pipe(
        tap({
          next: (newCategory) => this.addCategory(newCategory),
          error: (error) => this.setError(error.message)
        })
      ))
    );
  });

  readonly updateCategory = this.effect((params$: Observable<{ id: number, category: Category }>) => {
    return params$.pipe(
      tap(() => this.setLoading(true)),
      switchMap(({ id, category }) => this.categoryService.updateCategory(id, category).pipe(
        tap({
          next: (updatedCategory) => this.updateCategoryInList(updatedCategory),
          error: (error) => this.setError(error.message)
        })
      ))
    );
  });

  readonly deleteCategory = this.effect((categoryId$: Observable<number>) => {
    return categoryId$.pipe(
      tap(() => this.setLoading(true)),
      switchMap((categoryId) => this.categoryService.deleteCategory(categoryId).pipe(
        tap({
          next: () => this.removeCategory(categoryId),
          error: (error) => this.setError(error.message)
        })
      ))
    );
  });
} 