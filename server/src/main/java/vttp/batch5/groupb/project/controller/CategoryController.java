package vttp.batch5.groupb.project.controller;

import java.util.List;

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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import vttp.batch5.groupb.project.dto.CategoryDto;
import vttp.batch5.groupb.project.model.Category;
import vttp.batch5.groupb.project.model.User;
import vttp.batch5.groupb.project.service.CategoryService;
import vttp.batch5.groupb.project.service.UserDetailsImpl;
import vttp.batch5.groupb.project.service.UserService;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    
    @Autowired
    private CategoryService categoryService;
    
    @Autowired
    private UserService userService;
    
    @GetMapping
    public ResponseEntity<List<CategoryDto>> getAllCategories() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userService.findById(userDetails.getId());
        
        List<Category> categories = categoryService.findByUser(user);
        return ResponseEntity.ok(categoryService.convertToDtoList(categories));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<CategoryDto> getCategoryById(@PathVariable Long id) {
        Category category = categoryService.findById(id);
        return ResponseEntity.ok(categoryService.convertToDto(category));
    }
    
    @PostMapping
    public ResponseEntity<CategoryDto> createCategory(@Valid @RequestBody CategoryDto categoryDto) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        Category category = categoryService.createCategory(categoryDto, userDetails.getId());
        return ResponseEntity.ok(categoryService.convertToDto(category));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("@categoryService.findById(#id).user.id == authentication.principal.id")
    public ResponseEntity<CategoryDto> updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryDto categoryDto) {
        Category category = categoryService.updateCategory(id, categoryDto);
        return ResponseEntity.ok(categoryService.convertToDto(category));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("@categoryService.findById(#id).user.id == authentication.principal.id")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok("Category deleted successfully");
    }
} 