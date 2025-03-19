package vttp.batch5.groupb.project.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.jdbc.core.JdbcTemplate;

import io.micrometer.core.instrument.Counter;
import vttp.batch5.groupb.project.dto.TaskDto;
import vttp.batch5.groupb.project.model.Category;
import vttp.batch5.groupb.project.model.Task;
import vttp.batch5.groupb.project.model.TaskShare;
import vttp.batch5.groupb.project.model.User;
import vttp.batch5.groupb.project.repository.CategoryRepository;
import vttp.batch5.groupb.project.repository.TaskRepository;
import vttp.batch5.groupb.project.repository.TaskShareRepository;
import vttp.batch5.groupb.project.repository.UserRepository;

@Service
public class TaskService {
    
    @Autowired
    private TaskRepository taskRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private TaskShareRepository taskShareRepository;
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @Autowired
    private Counter taskCreatedCounter;
    
    @Autowired
    private Counter taskCompletedCounter;
    
    public List<Task> findByOwner(User owner) {
        return taskRepository.findByOwner(owner);
    }
    
    public List<Task> findByOwnerOrderByDueDate(User owner) {
        return taskRepository.findByOwnerOrderByDueDateAsc(owner);
    }
    
    public List<Task> findSharedWithUser(Long userId) {
        return taskRepository.findSharedWithUser(userId);
    }
    
    public boolean isTaskSharedWithUser(Long taskId, Long userId) {
        List<Task> sharedTasks = findSharedWithUser(userId);
        return sharedTasks.stream().anyMatch(task -> task.getId().equals(taskId));
    }
    
    public List<Task> findByCategoryId(Long categoryId) {
        return taskRepository.findByCategoryId(categoryId);
    }
    
    @Transactional
    public Task createTask(TaskDto taskDto, Long userId) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Task task = new Task();
        task.setTitle(taskDto.getTitle());
        task.setDescription(taskDto.getDescription());
        task.setStatus(taskDto.getStatus() != null ? taskDto.getStatus() : Task.TaskStatus.TODO);
        task.setDueDate(taskDto.getDueDate());
        task.setOwner(owner);
        
        if (taskDto.getCategoryId() != null) {
            Category category = categoryRepository.findById(taskDto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            task.setCategory(category);
        }
        
        Task savedTask = taskRepository.save(task);
        
        taskCreatedCounter.increment();
        
        return savedTask;
    }
    
    @Transactional
    public Task updateTask(Long taskId, TaskDto taskDto) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        
        Task.TaskStatus oldStatus = task.getStatus();
        
        task.setTitle(taskDto.getTitle());
        task.setDescription(taskDto.getDescription());
        if (taskDto.getStatus() != null) {
            task.setStatus(taskDto.getStatus());
        }
        task.setDueDate(taskDto.getDueDate());
        task.setUpdatedAt(LocalDateTime.now());
        
        if (taskDto.getCategoryId() != null) {
            Category category = categoryRepository.findById(taskDto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            task.setCategory(category);
        } else {
            task.setCategory(null);
        }
        
        Task updatedTask = taskRepository.save(task);
        
        if (oldStatus != Task.TaskStatus.DONE && task.getStatus() == Task.TaskStatus.DONE) {
            taskCompletedCounter.increment();
        }
        
        return updatedTask;
    }
    
    @Transactional
    public void deleteTask(Long taskId) {
        try {
            if (!taskRepository.existsById(taskId)) {
                throw new RuntimeException("Task not found with ID: " + taskId);
            }
            
            int sharesDeleted = jdbcTemplate.update(
                "DELETE FROM task_shares WHERE task_id = ?", 
                taskId
            );
            
            int tasksDeleted = jdbcTemplate.update(
                "DELETE FROM tasks WHERE id = ?", 
                taskId
            );
            
            if (tasksDeleted == 0) {
                throw new RuntimeException("Task could not be deleted - no rows affected");
            }
            
        } catch (Exception e) {
            throw new RuntimeException("Error deleting task: " + e.getMessage(), e);
        }
    }
    
    public Task findById(Long taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
    }
    
    public boolean existsById(Long taskId) {
        return taskRepository.existsById(taskId);
    }
    
    public Task saveTask(Task task) {
        return taskRepository.save(task);
    }
    
    public TaskDto convertToDto(Task task) {
        TaskDto dto = new TaskDto();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setStatus(task.getStatus());
        dto.setDueDate(task.getDueDate());
        dto.setCreatedAt(task.getCreatedAt());
        dto.setUpdatedAt(task.getUpdatedAt());
        dto.setOwnerId(task.getOwner().getId());
        dto.setOwnerUsername(task.getOwner().getUsername());
        
        if (task.getCategory() != null) {
            dto.setCategoryId(task.getCategory().getId());
            dto.setCategoryName(task.getCategory().getName());
        }
        
        return dto;
    }
    
    public List<TaskDto> convertToDtoList(List<Task> tasks) {
        return tasks.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
} 