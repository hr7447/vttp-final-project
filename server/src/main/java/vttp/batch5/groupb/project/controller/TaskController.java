package vttp.batch5.groupb.project.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import vttp.batch5.groupb.project.dto.TaskDto;
import vttp.batch5.groupb.project.model.Task;
import vttp.batch5.groupb.project.model.TaskShare;
import vttp.batch5.groupb.project.model.User;
import vttp.batch5.groupb.project.service.TaskService;
import vttp.batch5.groupb.project.service.TaskShareService;
import vttp.batch5.groupb.project.service.UserDetailsImpl;
import vttp.batch5.groupb.project.service.UserService;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    
    @Autowired
    private TaskService taskService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private TaskShareService taskShareService;
    
    @GetMapping
    public ResponseEntity<List<TaskDto>> getAllTasks() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userService.findById(userDetails.getId());
        
        List<Task> tasks = taskService.findByOwner(user);
        return ResponseEntity.ok(taskService.convertToDtoList(tasks));
    }
    
    @GetMapping("/shared")
    public ResponseEntity<List<TaskDto>> getSharedTasks() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        List<Task> tasks = taskService.findSharedWithUser(userDetails.getId());
        return ResponseEntity.ok(taskService.convertToDtoList(tasks));
    }
    
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<TaskDto>> getTasksByCategory(@PathVariable Long categoryId) {
        List<Task> tasks = taskService.findByCategoryId(categoryId);
        return ResponseEntity.ok(taskService.convertToDtoList(tasks));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<TaskDto> getTaskById(@PathVariable Long id) {
        Task task = taskService.findById(id);
        return ResponseEntity.ok(taskService.convertToDto(task));
    }
    
    @PostMapping
    public ResponseEntity<TaskDto> createTask(@Valid @RequestBody TaskDto taskDto) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        Task task = taskService.createTask(taskDto, userDetails.getId());
        return ResponseEntity.ok(taskService.convertToDto(task));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("@taskService.findById(#id).owner.id == authentication.principal.id")
    public ResponseEntity<TaskDto> updateTask(@PathVariable Long id, @Valid @RequestBody TaskDto taskDto) {
        Task task = taskService.updateTask(id, taskDto);
        return ResponseEntity.ok(taskService.convertToDto(task));
    }
    
    @PutMapping("/shared/{id}")
    public ResponseEntity<?> updateSharedTask(@PathVariable Long id, @Valid @RequestBody TaskDto taskDto) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body("Not authenticated");
            }
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();
            
            Task task = taskService.findById(id);
            if (task == null) {
                return ResponseEntity.notFound().build();
            }
            
            task.setStatus(taskDto.getStatus());
            Task updatedTask = taskService.updateTask(id, taskDto);
            
            return ResponseEntity.ok(taskService.convertToDto(updatedTask));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
    
    @PutMapping("/shared/{id}/status")
    public ResponseEntity<?> updateSharedTaskStatus(
            @PathVariable Long id, 
            @RequestParam("status") String statusStr) {
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
            taskService.saveTask(task);
            
            return ResponseEntity.ok(taskService.convertToDto(task));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable Long id) {
        try {
            if (!taskService.existsById(id)) {
                return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", "Task not found with ID: " + id
                ));
            }
            
            try {
                taskService.deleteTask(id);
                
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "id", id,
                    "message", "Task deleted successfully"
                ));
            } catch (Exception e) {
                return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "id", id,
                    "error", "Service error: " + e.getMessage(),
                    "type", e.getClass().getName()
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "id", id,
                "error", "Unexpected error: " + e.getMessage(),
                "type", e.getClass().getName()
            ));
        }
    }
    
    @GetMapping("/shared/debug")
    public ResponseEntity<?> debugSharedTasksAuth() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null) {
                return ResponseEntity.status(401).body("No authentication found");
            }
            
            Object principal = auth.getPrincipal();
            if (principal instanceof UserDetailsImpl) {
                UserDetailsImpl userDetails = (UserDetailsImpl) principal;
                return ResponseEntity.ok(
                    Map.of(
                        "authenticated", true, 
                        "username", userDetails.getUsername(),
                        "userId", userDetails.getId()
                    )
                );
            } else {
                return ResponseEntity.status(401).body("Principal is not UserDetailsImpl: " + principal);
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
    
    @CrossOrigin(origins = "*")
    @PutMapping("/shared/{id}/status-update")
    public ResponseEntity<?> publicUpdateTaskStatus(
            @PathVariable Long id, 
            @RequestParam("status") String statusStr) {
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
            taskService.saveTask(task);
            
            return ResponseEntity.ok(Map.of(
                "id", task.getId(),
                "title", task.getTitle(),
                "status", task.getStatus(),
                "message", "Task status updated successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
} 