import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import * as L from 'leaflet';

@Component({
  selector: 'app-task-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-4">
      <h2>Task Locations</h2>
      <p class="text-muted">View your tasks on the map</p>
      
      <div class="card mb-4">
        <div class="card-body">
          <div id="map" style="height: 500px; width: 100%;"></div>
        </div>
      </div>
      
      <div class="alert alert-info">
        <i class="bi bi-info-circle-fill me-2"></i>
        This is a demo map showing simulated task locations. In a real application, tasks would have actual location data.
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep .leaflet-popup-content {
      min-width: 200px;
    }
  `]
})
export class TaskMapComponent implements OnInit, AfterViewInit {
  private map!: L.Map;
  private center: L.LatLngExpression = [1.3521, 103.8198]; // Singapore
  private markers: L.Marker[] = [];
  private tasks: Task[] = [];
  
  constructor(private taskService: TaskService) {}
  
  ngOnInit(): void {
    this.loadTasks();
  }
  
  ngAfterViewInit(): void {
    this.initMap();
  }
  
  private initMap(): void {
    this.map = L.map('map').setView(this.center, 11);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18
    }).addTo(this.map);
    
    // Add markers if tasks already loaded
    if (this.tasks.length > 0) {
      this.addMarkersToMap();
    }
  }
  
  loadTasks(): void {
    this.taskService.getTasks().subscribe(tasks => {
      this.tasks = tasks;
      
      // Add markers if map is initialized
      if (this.map) {
        this.addMarkersToMap();
      }
    });
  }
  
  addMarkersToMap(): void {
    // Clear existing markers
    this.markers.forEach(marker => marker.remove());
    this.markers = [];
    
    // Create markers for each task
    this.tasks.forEach((task, index) => {
      // Generate random positions around Singapore
      const lat = (this.center as number[])[0] + (Math.random() - 0.5) * 0.1;
      const lng = (this.center as number[])[1] + (Math.random() - 0.5) * 0.1;
      
      // Create custom icon with label
      const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: #1976d2; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; justify-content: center; align-items: center; font-weight: bold;">${index + 1}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      
      // Create marker
      const marker = L.marker([lat, lng], { icon }).addTo(this.map);
      
      // Add popup
      marker.bindPopup(`
        <div>
          <h5>${task.title}</h5>
          <p>${task.description || 'No description'}</p>
          <p><strong>Status:</strong> ${task.status}</p>
          <p><strong>Due:</strong> ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</p>
        </div>
      `);
      
      this.markers.push(marker);
    });
  }
} 