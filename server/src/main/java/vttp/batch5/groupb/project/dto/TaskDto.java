package vttp.batch5.groupb.project.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import vttp.batch5.groupb.project.model.Task.TaskStatus;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskDto {
    
    private Long id;
    
    @NotBlank
    private String title;
    
    private String description;
    
    private TaskStatus status;
    
    private Long categoryId;
    
    private String categoryName;
    
    private LocalDateTime dueDate;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    private Long ownerId;
    
    private String ownerUsername;
} 