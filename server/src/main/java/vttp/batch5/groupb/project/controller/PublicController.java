package vttp.batch5.groupb.project.controller;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import vttp.batch5.groupb.project.model.Task;
import vttp.batch5.groupb.project.service.TaskService;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/public")
public class PublicController {
    
    @Autowired
    private TaskService taskService;
    
    @GetMapping("/health")
    @CrossOrigin(origins = {"https://client-production-ac24.up.railway.app", "http://localhost:4200"})
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "message", "Service is running",
            "timestamp", LocalDateTime.now().toString()
        ));
    }
    
    @PutMapping("/tasks/{id}/status")
    public ResponseEntity<?> updateTaskStatus(@PathVariable Long id, @RequestParam("status") String statusStr) {
        try {
            Task task = taskService.findById(id);
            if (task == null) {
                return ResponseEntity.notFound().build();
            }
            
            Task.TaskStatus status;
            try {
                status = Task.TaskStatus.valueOf(statusStr);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body("Invalid status: " + statusStr);
            }
            
            task.setStatus(status);
            task.setUpdatedAt(LocalDateTime.now());
            task = taskService.saveTask(task);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "id", task.getId(),
                "title", task.getTitle(),
                "status", task.getStatus().toString(),
                "message", "Task status updated successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }
    
    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable Long id) {
        try {
            Task task = taskService.findById(id);
            if (task == null) {
                return ResponseEntity.notFound().build();
            }
            
            taskService.deleteTask(id);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "id", id,
                "message", "Task deleted successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    @DeleteMapping("/no-auth/tasks/{id}")
    public ResponseEntity<?> deleteTaskNoAuth(@PathVariable Long id) {
        try {
            Task task = taskService.findById(id);
            if (task == null) {
                return ResponseEntity.notFound().build();
            }
            
            taskService.deleteTask(id);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "id", id,
                "message", "Task deleted successfully (no auth)"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }
} 