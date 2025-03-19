package vttp.batch5.groupb.project.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vttp.batch5.groupb.project.model.Category;
import vttp.batch5.groupb.project.model.User;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    List<Category> findByUser(User user);
    
    boolean existsByNameAndUser(String name, User user);
} 