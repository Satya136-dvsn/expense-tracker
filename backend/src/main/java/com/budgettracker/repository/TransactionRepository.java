package com.budgettracker.repository;
import com.budgettracker.model.Transaction;
import com.budgettracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    // Find transactions by user
    List<Transaction> findByUserOrderByTransactionDateDesc(User user);
    
    // Find transactions by user and type
    List<Transaction> findByUserAndTypeOrderByTransactionDateDesc(User user, Transaction.TransactionType type);
    
    // Find transactions by user and category
    List<Transaction> findByUserAndCategoryOrderByTransactionDateDesc(User user, String category);
    
    // Find transactions by user within date range
    List<Transaction> findByUserAndTransactionDateBetweenOrderByTransactionDateDesc(
            User user, LocalDateTime startDate, LocalDateTime endDate);
    
    // Find transactions by user, type and date range
    List<Transaction> findByUserAndTypeAndTransactionDateBetweenOrderByTransactionDateDesc(
            User user, Transaction.TransactionType type, LocalDateTime startDate, LocalDateTime endDate);
    
    // Calculate total income for user
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user = :user AND t.type = 'INCOME'")
    BigDecimal calculateTotalIncome(@Param("user") User user);
    
    // Calculate total expenses for user
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user = :user AND t.type = 'EXPENSE'")
    BigDecimal calculateTotalExpenses(@Param("user") User user);
    
    // Calculate total income for user within date range
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user = :user AND t.type = 'INCOME' AND t.transactionDate BETWEEN :startDate AND :endDate")
    BigDecimal calculateTotalIncomeInPeriod(@Param("user") User user, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Calculate total expenses for user within date range
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user = :user AND t.type = 'EXPENSE' AND t.transactionDate BETWEEN :startDate AND :endDate")
    BigDecimal calculateTotalExpensesInPeriod(@Param("user") User user, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Get expense breakdown by category
    @Query("SELECT t.category, COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user = :user AND t.type = 'EXPENSE' GROUP BY t.category ORDER BY SUM(t.amount) DESC")
    List<Object[]> getExpenseBreakdownByCategory(@Param("user") User user);
    
    // Get income breakdown by category
    @Query("SELECT t.category, COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user = :user AND t.type = 'INCOME' GROUP BY t.category ORDER BY SUM(t.amount) DESC")
    List<Object[]> getIncomeBreakdownByCategory(@Param("user") User user);
    
    // Get monthly transaction summary
    @Query("SELECT YEAR(t.transactionDate), MONTH(t.transactionDate), t.type, COALESCE(SUM(t.amount), 0) " +
           "FROM Transaction t WHERE t.user = :user " +
           "GROUP BY YEAR(t.transactionDate), MONTH(t.transactionDate), t.type " +
           "ORDER BY YEAR(t.transactionDate) DESC, MONTH(t.transactionDate) DESC")
    List<Object[]> getMonthlyTransactionSummary(@Param("user") User user);
    
    // Count transactions by user
    long countByUser(User user);
    
    // Count transactions by user and type
    long countByUserAndType(User user, Transaction.TransactionType type);
    
    // Get recent transactions (limit)
    @Query("SELECT t FROM Transaction t WHERE t.user = :user ORDER BY t.transactionDate DESC LIMIT :limit")
    List<Transaction> findRecentTransactions(@Param("user") User user, @Param("limit") int limit);
    
    // ===== NEW ANALYTICS QUERIES FOR MILESTONE 4 =====
    
    // Get monthly trend data
    @Query("SELECT YEAR(t.transactionDate), MONTH(t.transactionDate), " +
           "COALESCE(SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE 0 END), 0), " +
           "COALESCE(SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount ELSE 0 END), 0), " +
           "COUNT(t.id) " +
           "FROM Transaction t WHERE t.user = :user AND t.transactionDate BETWEEN :startDate AND :endDate " +
           "GROUP BY YEAR(t.transactionDate), MONTH(t.transactionDate) " +
           "ORDER BY YEAR(t.transactionDate) DESC, MONTH(t.transactionDate) DESC")
    List<Object[]> getMonthlyTrendData(@Param("user") User user, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Get category trend data over time
    @Query("SELECT t.category, YEAR(t.transactionDate), MONTH(t.transactionDate), " +
           "COALESCE(SUM(t.amount), 0), COUNT(t.id) " +
           "FROM Transaction t WHERE t.user = :user AND t.type = 'EXPENSE' " +
           "AND t.transactionDate BETWEEN :startDate AND :endDate " +
           "GROUP BY t.category, YEAR(t.transactionDate), MONTH(t.transactionDate) " +
           "ORDER BY YEAR(t.transactionDate) DESC, MONTH(t.transactionDate) DESC, SUM(t.amount) DESC")
    List<Object[]> getCategoryTrendData(@Param("user") User user, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Get average amount by category
    @Query("SELECT t.category, AVG(t.amount), COUNT(t.id) " +
           "FROM Transaction t WHERE t.user = :user AND t.type = 'EXPENSE' " +
           "GROUP BY t.category ORDER BY AVG(t.amount) DESC")
    List<Object[]> getAverageAmountByCategory(@Param("user") User user);
    
    // Get spending by day of week
    @Query("SELECT DAYOFWEEK(t.transactionDate), COALESCE(SUM(t.amount), 0), COUNT(t.id) " +
           "FROM Transaction t WHERE t.user = :user AND t.type = 'EXPENSE' " +
           "GROUP BY DAYOFWEEK(t.transactionDate) ORDER BY DAYOFWEEK(t.transactionDate)")
    List<Object[]> getSpendingByDayOfWeek(@Param("user") User user);

    // Find transactions by user ID and date range (for export service)
    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId AND DATE(t.transactionDate) BETWEEN :startDate AND :endDate ORDER BY t.transactionDate DESC")
    List<Transaction> findByUserIdAndTransactionDateBetween(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    // Find all transactions by user ID ordered by date (for export service)
    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId ORDER BY t.transactionDate DESC")
    List<Transaction> findByUserIdOrderByTransactionDateDesc(@Param("userId") Long userId);

    // Get total income by user ID (for export service)
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user.id = :userId AND t.type = 'INCOME'")
    BigDecimal getTotalIncomeByUser(@Param("userId") Long userId);

    // Get total expenses by user ID (for export service)
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user.id = :userId AND t.type = 'EXPENSE'")
    BigDecimal getTotalExpensesByUser(@Param("userId") Long userId);

    // Get transaction count by user ID (for export service)
    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.user.id = :userId")
    Long getTransactionCountByUser(@Param("userId") Long userId);

    // Get expense breakdown by category for user ID (for export service)
    @Query("SELECT new map(t.category as category, SUM(t.amount) as totalAmount) " +
           "FROM Transaction t WHERE t.user.id = :userId AND t.type = 'EXPENSE' " +
           "GROUP BY t.category ORDER BY SUM(t.amount) DESC")
    List<java.util.Map<String, Object>> getExpenseBreakdownByCategory(@Param("userId") Long userId);
    
    // Get expense breakdown by category within date range
    @Query("SELECT t.category, COALESCE(SUM(t.amount), 0), COUNT(t.id) " +
           "FROM Transaction t WHERE t.user = :user AND t.type = 'EXPENSE' " +
           "AND t.transactionDate BETWEEN :startDate AND :endDate " +
           "GROUP BY t.category ORDER BY SUM(t.amount) DESC")
    List<Object[]> getExpenseBreakdownInPeriod(@Param("user") User user, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Get income breakdown by category within date range
    @Query("SELECT t.category, COALESCE(SUM(t.amount), 0), COUNT(t.id) " +
           "FROM Transaction t WHERE t.user = :user AND t.type = 'INCOME' " +
           "AND t.transactionDate BETWEEN :startDate AND :endDate " +
           "GROUP BY t.category ORDER BY SUM(t.amount) DESC")
    List<Object[]> getIncomeBreakdownInPeriod(@Param("user") User user, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Count transactions by user after date
    long countByUserAndTransactionDateAfter(User user, LocalDateTime date);
    
    // Find transactions by user ID after a certain date
    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId AND t.transactionDate > :date ORDER BY t.transactionDate DESC")
    List<Transaction> findByUserIdAndTransactionDateAfter(@Param("userId") Long userId, @Param("date") LocalDateTime date);
    
    // Find transactions by user ID and date range (for bill reminder service)
    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId AND DATE(t.transactionDate) BETWEEN :startDate AND :endDate ORDER BY t.transactionDate DESC")
    List<Transaction> findByUserIdAndDateBetween(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}