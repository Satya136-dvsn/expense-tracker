package com.budgettracker.repository;

import com.budgettracker.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    // Find category by name (case-insensitive)
    Optional<Category> findByNameIgnoreCase(String name);
    
    // Find all active categories
    List<Category> findByIsActiveTrue();
    
    // Find categories by type
    List<Category> findByTypeOrderByName(Category.CategoryType type);
    
    // Find active categories by type
    List<Category> findByTypeAndIsActiveTrueOrderByName(Category.CategoryType type);
    
    // Find categories containing name (case-insensitive search)
    @Query("SELECT c FROM Category c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%')) AND c.isActive = true ORDER BY c.name")
    List<Category> findByNameContainingIgnoreCaseAndIsActiveTrue(String name);
    
    // Get income categories
    @Query("SELECT c FROM Category c WHERE c.type IN ('INCOME', 'BOTH') AND c.isActive = true ORDER BY c.name")
    List<Category> getIncomeCategories();
    
    // Get expense categories
    @Query("SELECT c FROM Category c WHERE c.type IN ('EXPENSE', 'BOTH') AND c.isActive = true ORDER BY c.name")
    List<Category> getExpenseCategories();
    
    // Check if category name exists (excluding specific id for updates)
    @Query("SELECT COUNT(c) > 0 FROM Category c WHERE LOWER(c.name) = LOWER(:name) AND c.id != :excludeId")
    boolean existsByNameIgnoreCaseAndIdNot(String name, Long excludeId);
    
    // Check if category name exists
    boolean existsByNameIgnoreCase(String name);
    
    // Count active categories
    long countByIsActiveTrue();
    
    // Count categories by type
    long countByType(Category.CategoryType type);
}