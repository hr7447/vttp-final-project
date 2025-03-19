package vttp.batch5.groupb.project.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import vttp.batch5.groupb.project.dto.TaskShareDto;
import vttp.batch5.groupb.project.model.Task;
import vttp.batch5.groupb.project.model.TaskShare;
import vttp.batch5.groupb.project.model.User;
import vttp.batch5.groupb.project.service.TaskService;
import vttp.batch5.groupb.project.service.TaskShareService;
import vttp.batch5.groupb.project.service.UserDetailsImpl;
import vttp.batch5.groupb.project.service.UserService;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/shares")
public class TaskShareController {
    
    @Autowired
    private TaskShareService taskShareService;
    
    @Autowired
    private TaskService taskService;
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/task/{taskId}")
    @PreAuthorize("@taskService.findById(#taskId).owner.id == authentication.principal.id")
    public ResponseEntity<List<TaskShareDto>> getSharesByTask(@PathVariable Long taskId) {
        Task task = taskService.findById(taskId);
        List<TaskShare> shares = taskShareService.findByTask(task);
        return ResponseEntity.ok(taskShareService.convertToDtoList(shares));
    }
    
    @GetMapping("/user")
    public ResponseEntity<List<TaskShareDto>> getSharesByUser() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userService.findById(userDetails.getId());
        
        List<TaskShare> shares = taskShareService.findByUser(user);
        return ResponseEntity.ok(taskShareService.convertToDtoList(shares));
    }
    
    @PostMapping("/task/{taskId}/user/{userId}")
    @PreAuthorize("@taskService.findById(#taskId).owner.id == authentication.principal.id")
    public ResponseEntity<TaskShareDto> shareTask(
            @PathVariable Long taskId,
            @PathVariable Long userId,
            @RequestParam(defaultValue = "VIEW") TaskShare.Permission permission) {
        
        TaskShare taskShare = taskShareService.shareTask(taskId, userId, permission);
        return ResponseEntity.ok(taskShareService.convertToDto(taskShare));
    }
    
    @PostMapping("/task/{taskId}/username/{username}")
    @PreAuthorize("@taskService.findById(#taskId).owner.id == authentication.principal.id")
    public ResponseEntity<TaskShareDto> shareTaskByUsername(
            @PathVariable Long taskId,
            @PathVariable String username,
            @RequestParam(defaultValue = "VIEW") TaskShare.Permission permission) {
        
        User user = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
        
        TaskShare taskShare = taskShareService.shareTask(taskId, user.getId(), permission);
        return ResponseEntity.ok(taskShareService.convertToDto(taskShare));
    }
    
    @PutMapping("/{shareId}")
    @PreAuthorize("@taskShareService.findById(#shareId).task.owner.id == authentication.principal.id")
    public ResponseEntity<TaskShareDto> updateSharePermission(
            @PathVariable Long shareId,
            @RequestParam TaskShare.Permission permission) {
        
        TaskShare taskShare = taskShareService.updateTaskSharePermission(shareId, permission);
        return ResponseEntity.ok(taskShareService.convertToDto(taskShare));
    }
    
    @DeleteMapping("/task/{taskId}/user/{userId}")
    @PreAuthorize("@taskService.findById(#taskId).owner.id == authentication.principal.id")
    public ResponseEntity<?> unshareTask(
            @PathVariable Long taskId,
            @PathVariable Long userId) {
        
        taskShareService.unshareTask(taskId, userId);
        return ResponseEntity.ok("Task unshared successfully");
    }
    
    @DeleteMapping("/task/{taskId}/username/{username}")
    @PreAuthorize("@taskService.findById(#taskId).owner.id == authentication.principal.id")
    public ResponseEntity<?> unshareTaskByUsername(
            @PathVariable Long taskId,
            @PathVariable String username) {
        
        try {
            User user = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
            
            taskShareService.unshareTask(taskId, user.getId());
            
            return ResponseEntity.ok()
                .body(Map.of(
                    "message", "Task unshared successfully",
                    "taskId", taskId,
                    "username", username
                ));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of(
                    "error", "Failed to unshare task",
                    "message", e.getMessage()
                ));
        }
    }
} 