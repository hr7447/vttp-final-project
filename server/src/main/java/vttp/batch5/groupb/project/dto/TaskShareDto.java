package vttp.batch5.groupb.project.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import vttp.batch5.groupb.project.model.TaskShare.Permission;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskShareDto {
    
    private Long id;
    
    private Long taskId;
    
    private String taskTitle;
    
    private Long userId;
    
    private String username;
    
    private Permission permission;
    
    private LocalDateTime sharedAt;
} 