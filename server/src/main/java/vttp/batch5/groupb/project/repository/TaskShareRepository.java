package vttp.batch5.groupb.project.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vttp.batch5.groupb.project.model.Task;
import vttp.batch5.groupb.project.model.TaskShare;
import vttp.batch5.groupb.project.model.User;

@Repository
public interface TaskShareRepository extends JpaRepository<TaskShare, Long> {
    
    List<TaskShare> findByUser(User user);
    
    List<TaskShare> findByTask(Task task);
    
    Optional<TaskShare> findByTaskAndUser(Task task, User user);
    
    void deleteByTaskAndUser(Task task, User user);
} 