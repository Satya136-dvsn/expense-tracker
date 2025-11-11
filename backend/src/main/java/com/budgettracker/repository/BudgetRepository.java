package com.budgettracker.repository;

import com.budgettracker.model.Budget;
import com.budgettracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    
    // Find all budgets for a user
    List<Budget> findByUserOrderByYearDescMonthDescCategoryAsc(User user);
    
    // Find budgets by user, month, and year
    List<Budget> findByUserAndMonthAndYearOrderByCategoryAsc(User user, Integer month, Integer year);
    
    // Find budget by user, category, month, and year
    Optional<Budget> findByUserAndCategoryAndMonthAndYear(User user, String category, Integer month, Integer year);
    
    // Find budgets by user and category
    List<Budget> findByUserAndCategoryOrderByYearDescMonthDesc(User user, String category);
    
    // Find current month budgets
    @Query("SELECT b FROM Budget b WHERE b.user = :user AND b.month = :month AND b.year = :year")
    List<Budget> findCurrentMonthBudgets(@Param("user") User user, @Param("month") Integer month, @Param("year") Integer year);
    
    // Get total budget for a user in a specific month/year
    @Query("SELECT COALESCE(SUM(b.budgetAmount), 0) FROM Budget b WHERE b.user = :user AND b.month = :month AND b.year = :year")
    java.math.BigDecimal getTotalBudgetForMonth(@Param("user") User user, @Param("month") Integer month, @Param("year") Integer year);
    
    // Get total spent for a user in a specific month/year
    @Query("SELECT COALESCE(SUM(b.spentAmount), 0) FROM Budget b WHERE b.user = :user AND b.month = :month AND b.year = :year")
    java.math.BigDecimal getTotalSpentForMonth(@Param("user") User user, @Param("month") Integer month, @Param("year") Integer year);
    
    // Count budgets by user
    long countByUser(User user);
    
    // Delete budget by user and id
    void deleteByUserAndId(User user, Long id);
    
    // Get budget analysis data (budget vs actual spending)
    @Query("SELECT b.category, b.budgetAmount, " +
           "COALESCE((SELECT SUM(t.amount) FROM Transaction t " +
           "WHERE t.user = :user AND t.category = b.category AND t.type = 'EXPENSE' " +
           "AND YEAR(t.transactionDate) = :year AND MONTH(t.transactionDate) = :month), 0) " +
           "FROM Budget b WHERE b.user = :user AND b.month = :month AND b.year = :year " +
           "ORDER BY b.category")
    List<Object[]> getBudgetAnalysisData(@Param("user") User user, @Param("month") Integer month, @Param("year") Integer year);
}
