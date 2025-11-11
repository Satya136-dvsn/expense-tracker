package com.budgettracker.repository;

import com.budgettracker.model.Debt;
import com.budgettracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface DebtRepository extends JpaRepository<Debt, Long> {
    
    // Find all debts for a user
    List<Debt> findByUserOrderByCreatedAtDesc(User user);
    
    // Find debts by user and status
    List<Debt> findByUserAndStatusOrderByCreatedAtDesc(User user, Debt.DebtStatus status);
    
    // Find active debts (ACTIVE status)
    List<Debt> findByUserAndStatus(User user, Debt.DebtStatus status);
    
    // Find debt by user and id
    Optional<Debt> findByUserAndId(User user, Long id);
    
    // Find debts by user and IDs (for optimization)
    List<Debt> findByUserAndIdIn(User user, List<Long> ids);
    
    // Get total debt amount for all active debts
    @Query("SELECT COALESCE(SUM(d.currentBalance), 0) FROM Debt d WHERE d.user = :user AND d.status = 'ACTIVE'")
    BigDecimal getTotalActiveDebt(@Param("user") User user);
    
    // Get total minimum payments for all active debts
    @Query("SELECT COALESCE(SUM(d.minimumPayment), 0) FROM Debt d WHERE d.user = :user AND d.status = 'ACTIVE'")
    BigDecimal getTotalMinimumPayments(@Param("user") User user);
    
    // Get average interest rate for active debts (weighted by balance)
    @Query("SELECT COALESCE(SUM(d.interestRate * d.currentBalance) / SUM(d.currentBalance), 0) " +
           "FROM Debt d WHERE d.user = :user AND d.status = 'ACTIVE' AND d.currentBalance > 0")
    BigDecimal getWeightedAverageInterestRate(@Param("user") User user);
    
    // Count active debts
    long countByUserAndStatus(User user, Debt.DebtStatus status);
    
    // Count all debts for user
    long countByUser(User user);
    
    // Delete debt by user and id
    void deleteByUserAndId(User user, Long id);
    
    // Get debt summary data for analytics
    @Query("SELECT d.type, COUNT(d), SUM(d.currentBalance), AVG(d.interestRate) " +
           "FROM Debt d WHERE d.user = :user AND d.status = 'ACTIVE' GROUP BY d.type")
    List<Object[]> getDebtSummaryByType(@Param("user") User user);
    
    // Find debts ordered by interest rate (highest first) for avalanche method
    @Query("SELECT d FROM Debt d WHERE d.user = :user AND d.status = 'ACTIVE' " +
           "ORDER BY d.interestRate DESC, d.currentBalance DESC")
    List<Debt> findActiveDebtsOrderedByInterestRateDesc(@Param("user") User user);
    
    // Find debts ordered by balance (smallest first) for snowball method
    @Query("SELECT d FROM Debt d WHERE d.user = :user AND d.status = 'ACTIVE' " +
           "ORDER BY d.currentBalance ASC, d.interestRate DESC")
    List<Debt> findActiveDebtsOrderedByBalanceAsc(@Param("user") User user);
    
    // Find debts by specific IDs ordered by interest rate
    @Query("SELECT d FROM Debt d WHERE d.user = :user AND d.id IN :debtIds AND d.status = 'ACTIVE' " +
           "ORDER BY d.interestRate DESC, d.currentBalance DESC")
    List<Debt> findSpecificDebtsOrderedByInterestRateDesc(@Param("user") User user, @Param("debtIds") List<Long> debtIds);
    
    // Find debts by specific IDs ordered by balance
    @Query("SELECT d FROM Debt d WHERE d.user = :user AND d.id IN :debtIds AND d.status = 'ACTIVE' " +
           "ORDER BY d.currentBalance ASC, d.interestRate DESC")
    List<Debt> findSpecificDebtsOrderedByBalanceAsc(@Param("user") User user, @Param("debtIds") List<Long> debtIds);
}