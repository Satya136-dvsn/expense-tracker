package com.budgettracker.service;

import com.budgettracker.model.Category;
import com.budgettracker.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CategoryService {
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    // Get all active categories
    public List<Category> getAllActiveCategories() {
        return categoryRepository.findByIsActiveTrue();
    }
    
    // Get categories by type
    public List<Category> getCategoriesByType(Category.CategoryType type) {
        return categoryRepository.findByTypeAndIsActiveTrueOrderByName(type);
    }
    
    // Get income categories
    public List<Category> getIncomeCategories() {
        return categoryRepository.getIncomeCategories();
    }
    
    // Get expense categories
    public List<Category> getExpenseCategories() {
        return categoryRepository.getExpenseCategories();
    }
    
    // Get category by ID
    public Optional<Category> getCategoryById(Long id) {
        return categoryRepository.findById(id);
    }
    
    // Get category by name
    public Optional<Category> getCategoryByName(String name) {
        return categoryRepository.findByNameIgnoreCase(name);
    }
    
    // Create new category
    public Category createCategory(Category category) {
        // Check if category name already exists
        if (categoryRepository.existsByNameIgnoreCase(category.getName())) {
            throw new RuntimeException("Category with name '" + category.getName() + "' already exists");
        }
        
        return categoryRepository.save(category);
    }
    
    // Update category
    public Category updateCategory(Long id, Category categoryUpdate) {
        Category existingCategory = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        
        // Check if the new name conflicts with another category (excluding current one)
        if (categoryRepository.existsByNameIgnoreCaseAndIdNot(categoryUpdate.getName(), id)) {
            throw new RuntimeException("Category with name '" + categoryUpdate.getName() + "' already exists");
        }
        
        existingCategory.setName(categoryUpdate.getName());
        existingCategory.setDescription(categoryUpdate.getDescription());
        existingCategory.setType(categoryUpdate.getType());
        existingCategory.setIconName(categoryUpdate.getIconName());
        existingCategory.setColorCode(categoryUpdate.getColorCode());
        existingCategory.setIsActive(categoryUpdate.getIsActive());
        
        return categoryRepository.save(existingCategory);
    }
    
    // Soft delete category (set as inactive)
    public void deactivateCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        
        category.setIsActive(false);
        categoryRepository.save(category);
    }
    
    // Activate category
    public void activateCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        
        category.setIsActive(true);
        categoryRepository.save(category);
    }
    
    // Hard delete category (permanent deletion)
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        
        categoryRepository.delete(category);
    }
    
    // Search categories by name
    public List<Category> searchCategoriesByName(String name) {
        return categoryRepository.findByNameContainingIgnoreCaseAndIsActiveTrue(name);
    }
    
    // Get category statistics
    public long getCategoryCount() {
        return categoryRepository.countByIsActiveTrue();
    }
    
    // Get category count by type
    public long getCategoryCountByType(Category.CategoryType type) {
        return categoryRepository.countByType(type);
    }
    
    // Initialize default categories
    public void initializeDefaultCategories() {
        // Only initialize if no categories exist
        if (categoryRepository.count() == 0) {
            createDefaultIncomeCategories();
            createDefaultExpenseCategories();
        }
    }
    
    private void createDefaultIncomeCategories() {
        // Income categories
        Category[] incomeCategories = {
            new Category("Salary", "Regular monthly salary", Category.CategoryType.INCOME, "💼", "#4CAF50", true),
            new Category("Freelance", "Freelance work income", Category.CategoryType.INCOME, "💻", "#2196F3", true),
            new Category("Investment", "Investment returns", Category.CategoryType.INCOME, "📈", "#FF9800", true),
            new Category("Bonus", "Work bonus", Category.CategoryType.INCOME, "🎁", "#9C27B0", true),
            new Category("Side Business", "Side business income", Category.CategoryType.INCOME, "🏪", "#607D8B", true),
            new Category("Rental", "Rental income", Category.CategoryType.INCOME, "🏠", "#795548", true),
            new Category("Gift", "Money received as gift", Category.CategoryType.INCOME, "💝", "#E91E63", true),
            new Category("Other Income", "Other sources of income", Category.CategoryType.INCOME, "💰", "#00BCD4", true)
        };
        
        for (Category category : incomeCategories) {
            if (!categoryRepository.existsByNameIgnoreCase(category.getName())) {
                categoryRepository.save(category);
            }
        }
    }
    
    private void createDefaultExpenseCategories() {
        // Expense categories
        Category[] expenseCategories = {
            new Category("Food & Dining", "Restaurants, groceries, food delivery", Category.CategoryType.EXPENSE, "🍽️", "#FF5722", true),
            new Category("Transportation", "Gas, public transport, car maintenance", Category.CategoryType.EXPENSE, "🚗", "#3F51B5", true),
            new Category("Shopping", "Clothes, electronics, miscellaneous purchases", Category.CategoryType.EXPENSE, "🛍️", "#E91E63", true),
            new Category("Entertainment", "Movies, concerts, hobbies", Category.CategoryType.EXPENSE, "🎬", "#9C27B0", true),
            new Category("Bills & Utilities", "Electricity, water, internet, phone", Category.CategoryType.EXPENSE, "💡", "#FF9800", true),
            new Category("Healthcare", "Medical expenses, pharmacy, insurance", Category.CategoryType.EXPENSE, "🏥", "#F44336", true),
            new Category("Education", "Books, courses, training", Category.CategoryType.EXPENSE, "📚", "#2196F3", true),
            new Category("Travel", "Vacation, business trips", Category.CategoryType.EXPENSE, "✈️", "#00BCD4", true),
            new Category("Housing", "Rent, mortgage, home maintenance", Category.CategoryType.EXPENSE, "🏠", "#795548", true),
            new Category("Insurance", "Life, health, car insurance", Category.CategoryType.EXPENSE, "🛡️", "#607D8B", true),
            new Category("Fitness", "Gym membership, sports equipment", Category.CategoryType.EXPENSE, "💪", "#4CAF50", true),
            new Category("Personal Care", "Haircut, cosmetics, spa", Category.CategoryType.EXPENSE, "💄", "#E91E63", true),
            new Category("Gifts & Donations", "Gifts for others, charitable donations", Category.CategoryType.EXPENSE, "🎁", "#9C27B0", true),
            new Category("Other Expenses", "Miscellaneous expenses", Category.CategoryType.EXPENSE, "💸", "#757575", true)
        };
        
        for (Category category : expenseCategories) {
            if (!categoryRepository.existsByNameIgnoreCase(category.getName())) {
                categoryRepository.save(category);
            }
        }
    }
}