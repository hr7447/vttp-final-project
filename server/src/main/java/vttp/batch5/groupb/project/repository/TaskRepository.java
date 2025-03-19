package vttp.batch5.groupb.project.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import vttp.batch5.groupb.project.model.Task;
import vttp.batch5.groupb.project.model.User;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    
    List<Task> findByOwner(User owner);
    
    List<Task> findByOwnerOrderByDueDateAsc(User owner);
    
    @Query("SELECT t FROM Task t JOIN t.sharedWith s WHERE s.user.id = :userId")
    List<Task> findSharedWithUser(Long userId);
    
    List<Task> findByCategoryId(Long categoryId);
} 