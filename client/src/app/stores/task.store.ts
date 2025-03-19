import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Observable, switchMap, tap } from 'rxjs';
import { TaskService } from '../services/task.service';
import { Task } from '../models/task.model';

interface TaskState {
  tasks: Task[];
  sharedTasks: Task[];
  selectedTask: Task | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  sharedTasks: [],
  selectedTask: null,
  isLoading: false,
  error: null
};

@Injectable()
export class TaskStore extends ComponentStore<TaskState> {
  constructor(private taskService: TaskService) {
    super(initialState);
  }

  // Selectors
  readonly tasks$ = this.select(state => state.tasks);
  readonly sharedTasks$ = this.select(state => state.sharedTasks);
  readonly selectedTask$ = this.select(state => state.selectedTask);
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

  readonly setTasks = this.updater((state, tasks: Task[]) => ({
    ...state,
    tasks,
    isLoading: false
  }));

  readonly setSharedTasks = this.updater((state, sharedTasks: Task[]) => ({
    ...state,
    sharedTasks,
    isLoading: false
  }));

  readonly setSelectedTask = this.updater((state, selectedTask: Task | null) => ({
    ...state,
    selectedTask,
    isLoading: false
  }));

  readonly addTask = this.updater((state, task: Task) => ({
    ...state,
    tasks: [...state.tasks, task],
    isLoading: false
  }));

  readonly updateTaskInList = this.updater((state, updatedTask: Task) => ({
    ...state,
    tasks: state.tasks.map(task => task.id === updatedTask.id ? updatedTask : task),
    sharedTasks: state.sharedTasks.map(task => task.id === updatedTask.id ? updatedTask : task),
    selectedTask: state.selectedTask?.id === updatedTask.id ? updatedTask : state.selectedTask,
    isLoading: false
  }));

  readonly removeTask = this.updater((state, taskId: number) => ({
    ...state,
    tasks: state.tasks.filter(task => task.id !== taskId),
    sharedTasks: state.sharedTasks.filter(task => task.id !== taskId),
    selectedTask: state.selectedTask?.id === taskId ? null : state.selectedTask,
    isLoading: false
  }));

  // Effects
  readonly loadTasks = this.effect((trigger$: Observable<void>) => {
    return trigger$.pipe(
      tap(() => this.setLoading(true)),
      switchMap(() => this.taskService.getTasks().pipe(
        tap({
          next: (tasks) => this.setTasks(tasks),
          error: (error) => this.setError(error.message)
        })
      ))
    );
  });

  readonly loadSharedTasks = this.effect((trigger$: Observable<void>) => {
    return trigger$.pipe(
      tap(() => this.setLoading(true)),
      switchMap(() => this.taskService.getSharedTasks().pipe(
        tap({
          next: (tasks) => this.setSharedTasks(tasks),
          error: (error) => this.setError(error.message)
        })
      ))
    );
  });

  readonly loadTask = this.effect((taskId$: Observable<number>) => {
    return taskId$.pipe(
      tap(() => this.setLoading(true)),
      switchMap((taskId) => this.taskService.getTask(taskId).pipe(
        tap({
          next: (task) => this.setSelectedTask(task),
          error: (error) => this.setError(error.message)
        })
      ))
    );
  });

  readonly createTask = this.effect((task$: Observable<Task>) => {
    return task$.pipe(
      tap(() => this.setLoading(true)),
      switchMap((task) => this.taskService.createTask(task).pipe(
        tap({
          next: (newTask) => this.addTask(newTask),
          error: (error) => this.setError(error.message)
        })
      ))
    );
  });

  readonly updateTask = this.effect((params$: Observable<{ id: number, task: Task }>) => {
    return params$.pipe(
      tap(() => this.setLoading(true)),
      switchMap(({ id, task }) => this.taskService.updateTask(id, task).pipe(
        tap({
          next: (updatedTask) => this.updateTaskInList(updatedTask),
          error: (error) => this.setError(error.message)
        })
      ))
    );
  });

  readonly updateSharedTask = this.effect((params$: Observable<{ id: number, task: Task }>) => {
    return params$.pipe(
      tap(() => this.setLoading(true)),
      switchMap(({ id, task }) => this.taskService.updateSharedTask(id, task).pipe(
        tap({
          next: (updatedTask) => this.updateTaskInList(updatedTask),
          error: (error) => this.setError(error.message)
        })
      ))
    );
  });

  readonly deleteTask = this.effect((taskId$: Observable<number>) => {
    return taskId$.pipe(
      tap(() => this.setLoading(true)),
      switchMap((taskId) => this.taskService.deleteTask(taskId).pipe(
        tap({
          next: () => this.removeTask(taskId),
          error: (error) => this.setError(error.message)
        })
      ))
    );
  });
} 