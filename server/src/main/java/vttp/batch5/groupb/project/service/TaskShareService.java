package vttp.batch5.groupb.project.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import vttp.batch5.groupb.project.dto.TaskShareDto;
import vttp.batch5.groupb.project.model.Task;
import vttp.batch5.groupb.project.model.TaskShare;
import vttp.batch5.groupb.project.model.User;
import vttp.batch5.groupb.project.repository.TaskRepository;
import vttp.batch5.groupb.project.repository.TaskShareRepository;
import vttp.batch5.groupb.project.repository.UserRepository;

@Service
public class TaskShareService {
    
    @Autowired
    private TaskShareRepository taskShareRepository;
    
    @Autowired
    private TaskRepository taskRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EmailService emailService;
    
    public List<TaskShare> findByUser(User user) {
        return taskShareRepository.findByUser(user);
    }
    
    public List<TaskShare> findByTask(Task task) {
        return taskShareRepository.findByTask(task);
    }
    
    @Transactional
    public TaskShare shareTask(Long taskId, Long userId, TaskShare.Permission permission) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (taskShareRepository.findByTaskAndUser(task, user).isPresent()) {
            throw new RuntimeException("Task is already shared with this user");
        }
        
        if (task.getOwner().getId().equals(userId)) {
            throw new RuntimeException("Cannot share task with its owner");
        }
        
        TaskShare taskShare = new TaskShare();
        taskShare.setTask(task);
        taskShare.setUser(user);
        taskShare.setPermission(permission);
        
        TaskShare savedTaskShare = taskShareRepository.save(taskShare);
        
        try {
            emailService.sendTaskSharedEmail(task.getOwner(), user, task);
        } catch (Exception e) {
        }
        
        return savedTaskShare;
    }
    
    @Transactional
    public TaskShare updateTaskSharePermission(Long taskShareId, TaskShare.Permission permission) {
        TaskShare taskShare = taskShareRepository.findById(taskShareId)
                .orElseThrow(() -> new RuntimeException("Task share not found"));
        
        taskShare.setPermission(permission);
        
        return taskShareRepository.save(taskShare);
    }
    
    @Transactional
    public void unshareTask(Long taskId, Long userId) {
        try {
            Task task = taskRepository.findById(taskId)
                    .orElseThrow(() -> new RuntimeException("Task not found with ID: " + taskId));
            
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
            
            TaskShare taskShare = taskShareRepository.findByTaskAndUser(task, user)
                    .orElseThrow(() -> new RuntimeException("Task is not shared with this user"));
            
            taskShareRepository.deleteById(taskShare.getId());
        } catch (Exception e) {
            throw e;
        }
    }
    
    public TaskShare findById(Long id) {
        return taskShareRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task share not found"));
    }
    
    public TaskShare.Permission getTaskSharePermission(Long taskId, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return taskShareRepository.findByTaskAndUser(task, user)
                .map(TaskShare::getPermission)
                .orElseThrow(() -> new RuntimeException("Task is not shared with this user"));
    }
    
    public TaskShareDto convertToDto(TaskShare taskShare) {
        TaskShareDto dto = new TaskShareDto();
        dto.setId(taskShare.getId());
        dto.setTaskId(taskShare.getTask().getId());
        dto.setTaskTitle(taskShare.getTask().getTitle());
        dto.setUserId(taskShare.getUser().getId());
        dto.setUsername(taskShare.getUser().getUsername());
        dto.setPermission(taskShare.getPermission());
        dto.setSharedAt(taskShare.getSharedAt());
        
        return dto;
    }
    
    public List<TaskShareDto> convertToDtoList(List<TaskShare> taskShares) {
        return taskShares.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
} 