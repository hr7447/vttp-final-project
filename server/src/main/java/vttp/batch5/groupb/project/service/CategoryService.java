package vttp.batch5.groupb.project.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import vttp.batch5.groupb.project.dto.CategoryDto;
import vttp.batch5.groupb.project.model.Category;
import vttp.batch5.groupb.project.model.User;
import vttp.batch5.groupb.project.repository.CategoryRepository;
import vttp.batch5.groupb.project.repository.UserRepository;

@Service
public class CategoryService {
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public List<Category> findByUser(User user) {
        return categoryRepository.findByUser(user);
    }
    
    public boolean existsByNameAndUser(String name, User user) {
        return categoryRepository.existsByNameAndUser(name, user);
    }
    
    @Transactional
    public Category createCategory(CategoryDto categoryDto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (existsByNameAndUser(categoryDto.getName(), user)) {
            throw new RuntimeException("Category with this name already exists for this user");
        }
        
        Category category = new Category();
        category.setName(categoryDto.getName());
        category.setColor(categoryDto.getColor());
        category.setUser(user);
        
        return categoryRepository.save(category);
    }
    
    @Transactional
    public Category updateCategory(Long categoryId, CategoryDto categoryDto) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        
        category.setName(categoryDto.getName());
        category.setColor(categoryDto.getColor());
        
        return categoryRepository.save(category);
    }
    
    public void deleteCategory(Long categoryId) {
        categoryRepository.deleteById(categoryId);
    }
    
    public Category findById(Long categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
    }
    
    public CategoryDto convertToDto(Category category) {
        CategoryDto dto = new CategoryDto();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setColor(category.getColor());
        dto.setUserId(category.getUser().getId());
        
        return dto;
    }
    
    public List<CategoryDto> convertToDtoList(List<Category> categories) {
        return categories.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
} 