package com.budgettracker.controller;

import com.budgettracker.model.Category;
import com.budgettracker.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "http://localhost:5173")
public class CategoryController {
    
    @Autowired
    private CategoryService categoryService;
    
    // Get all active categories
    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getAllActiveCategories() {
        try {
            List<Category> categories = categoryService.getAllActiveCategories();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching categories: " + e.getMessage());
        }
    }
    
    // Get categories by type
    @GetMapping("/type/{type}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getCategoriesByType(@PathVariable String type) {
        try {
            Category.CategoryType categoryType = Category.CategoryType.valueOf(type.toUpperCase());
            List<Category> categories = categoryService.getCategoriesByType(categoryType);
            return ResponseEntity.ok(categories);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid category type: " + type);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching categories: " + e.getMessage());
        }
    }
    
    // Get income categories
    @GetMapping("/income")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getIncomeCategories() {
        try {
            List<Category> categories = categoryService.getIncomeCategories();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching income categories: " + e.getMessage());
        }
    }
    
    // Get expense categories
    @GetMapping("/expense")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getExpenseCategories() {
        try {
            List<Category> categories = categoryService.getExpenseCategories();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching expense categories: " + e.getMessage());
        }
    }
    
    // Get category by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getCategoryById(@PathVariable Long id) {
        try {
            Optional<Category> category = categoryService.getCategoryById(id);
            if (category.isPresent()) {
                return ResponseEntity.ok(category.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching category: " + e.getMessage());
        }
    }
    
    // Search categories by name
    @GetMapping("/search")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> searchCategories(@RequestParam String name) {
        try {
            List<Category> categories = categoryService.searchCategoriesByName(name);
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error searching categories: " + e.getMessage());
        }
    }
    
    // Create new category (Admin only)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createCategory(@Valid @RequestBody Category category) {
        try {
            Category createdCategory = categoryService.createCategory(category);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdCategory);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating category: " + e.getMessage());
        }
    }
    
    // Update category (Admin only)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @Valid @RequestBody Category category) {
        try {
            Category updatedCategory = categoryService.updateCategory(id, category);
            return ResponseEntity.ok(updatedCategory);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating category: " + e.getMessage());
        }
    }
    
    // Deactivate category (Admin only)
    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deactivateCategory(@PathVariable Long id) {
        try {
            categoryService.deactivateCategory(id);
            return ResponseEntity.ok().body("Category deactivated successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deactivating category: " + e.getMessage());
        }
    }
    
    // Activate category (Admin only)
    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> activateCategory(@PathVariable Long id) {
        try {
            categoryService.activateCategory(id);
            return ResponseEntity.ok().body("Category activated successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error activating category: " + e.getMessage());
        }
    }
    
    // Delete category permanently (Admin only)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        try {
            categoryService.deleteCategory(id);
            return ResponseEntity.ok().body("Category deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting category: " + e.getMessage());
        }
    }
    
    // Get category statistics (Admin only)
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getCategoryStatistics() {
        try {
            long totalCategories = categoryService.getCategoryCount();
            long incomeCategories = categoryService.getCategoryCountByType(Category.CategoryType.INCOME);
            long expenseCategories = categoryService.getCategoryCountByType(Category.CategoryType.EXPENSE);
            long bothCategories = categoryService.getCategoryCountByType(Category.CategoryType.BOTH);
            
            return ResponseEntity.ok(new Object() {
                public final long total = totalCategories;
                public final long income = incomeCategories;
                public final long expense = expenseCategories;
                public final long both = bothCategories;
            });
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching category statistics: " + e.getMessage());
        }
    }
    
    // Initialize default categories (Admin only)
    @PostMapping("/initialize")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> initializeDefaultCategories() {
        try {
            categoryService.initializeDefaultCategories();
            return ResponseEntity.ok().body("Default categories initialized successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error initializing categories: " + e.getMessage());
        }
    }
}