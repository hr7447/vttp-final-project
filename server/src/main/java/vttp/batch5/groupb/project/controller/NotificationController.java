package vttp.batch5.groupb.project.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import vttp.batch5.groupb.project.model.Task;
import vttp.batch5.groupb.project.model.User;
import vttp.batch5.groupb.project.service.EmailService;
import vttp.batch5.groupb.project.service.TaskService;
import vttp.batch5.groupb.project.service.UserDetailsImpl;
import vttp.batch5.groupb.project.service.UserService;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private EmailService emailService;
    
    @Autowired
    private TaskService taskService;
    
    @Autowired
    private UserService userService;
    
    @PostMapping("/tasks/{taskId}/remind")
    public ResponseEntity<?> sendTaskReminder(@PathVariable Long taskId) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User currentUser = userService.findById(userDetails.getId());
        
        Task task = taskService.findById(taskId);
        
        if (!task.getOwner().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(403).body("You are not authorized to send reminders for this task");
        }
        
        try {
            emailService.sendTaskReminderEmail(currentUser, task);
            return ResponseEntity.ok("Reminder email sent successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to send reminder email: " + e.getMessage());
        }
    }
} 