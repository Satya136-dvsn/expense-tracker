package com.budgettracker.repository;

import com.budgettracker.model.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    
    /**
     * Find all bills for a specific user
     */
    List<Bill> findByUserIdOrderByNextDueDateAsc(Long userId);
    
    /**
     * Find active bills for a specific user
     */
    List<Bill> findByUserIdAndStatusOrderByNextDueDateAsc(Long userId, Bill.BillStatus status);
    
    /**
     * Find bills by category for a specific user
     */
    List<Bill> findByUserIdAndCategoryOrderByNextDueDateAsc(Long userId, String category);
    
    /**
     * Find bills due within a specific date range
     */
    @Query("SELECT b FROM Bill b WHERE b.userId = :userId AND b.nextDueDate BETWEEN :startDate AND :endDate ORDER BY b.nextDueDate ASC")
    List<Bill> findBillsDueInDateRange(@Param("userId") Long userId, 
                                      @Param("startDate") LocalDate startDate, 
                                      @Param("endDate") LocalDate endDate);
    
    /**
     * Find overdue bills (next due date is before today)
     */
    @Query("SELECT b FROM Bill b WHERE b.userId = :userId AND b.nextDueDate < :today AND b.status = 'ACTIVE' ORDER BY b.nextDueDate ASC")
    List<Bill> findOverdueBills(@Param("userId") Long userId, @Param("today") LocalDate today);
    
    /**
     * Find bills due today
     */
    @Query("SELECT b FROM Bill b WHERE b.userId = :userId AND b.nextDueDate = :today AND b.status = 'ACTIVE' ORDER BY b.name ASC")
    List<Bill> findBillsDueToday(@Param("userId") Long userId, @Param("today") LocalDate today);
    
    /**
     * Find bills due within the next N days
     */
    @Query("SELECT b FROM Bill b WHERE b.userId = :userId AND b.nextDueDate BETWEEN :today AND :futureDate AND b.status = 'ACTIVE' ORDER BY b.nextDueDate ASC")
    List<Bill> findBillsDueWithinDays(@Param("userId") Long userId, 
                                     @Param("today") LocalDate today, 
                                     @Param("futureDate") LocalDate futureDate);
    
    /**
     * Find bills that need reminders (due within reminder days)
     */
    @Query("SELECT b FROM Bill b WHERE b.userId = :userId AND b.nextDueDate BETWEEN :today AND :futureDate AND b.status = 'ACTIVE'")
    List<Bill> findBillsNeedingReminders(@Param("userId") Long userId, @Param("today") LocalDate today, @Param("futureDate") LocalDate futureDate);
    
    /**
     * Calculate total monthly bill amount for a user
     */
    @Query("SELECT COALESCE(SUM(CASE " +
           "WHEN b.frequency = 'WEEKLY' THEN b.amount * 4.33 " +
           "WHEN b.frequency = 'BI_WEEKLY' THEN b.amount * 2.17 " +
           "WHEN b.frequency = 'MONTHLY' THEN b.amount " +
           "WHEN b.frequency = 'QUARTERLY' THEN b.amount / 3 " +
           "WHEN b.frequency = 'SEMI_ANNUALLY' THEN b.amount / 6 " +
           "WHEN b.frequency = 'ANNUALLY' THEN b.amount / 12 " +
           "ELSE 0 END), 0) " +
           "FROM Bill b WHERE b.userId = :userId AND b.status = 'ACTIVE'")
    Double calculateMonthlyBillTotal(@Param("userId") Long userId);
    
    /**
     * Find bills by frequency
     */
    List<Bill> findByUserIdAndFrequencyOrderByNextDueDateAsc(Long userId, Bill.BillFrequency frequency);
    
    /**
     * Count active bills for a user
     */
    long countByUserIdAndStatus(Long userId, Bill.BillStatus status);
    
    /**
     * Find bills with auto-pay enabled
     */
    List<Bill> findByUserIdAndAutoPayTrueAndStatusOrderByNextDueDateAsc(Long userId, Bill.BillStatus status);
}