package com.budgettracker.repository;

import com.budgettracker.model.BillPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BillPaymentRepository extends JpaRepository<BillPayment, Long> {
    
    /**
     * Find all payments for a specific bill
     */
    List<BillPayment> findByBillIdOrderByPaymentDateDesc(Long billId);
    
    /**
     * Find all payments for a specific user
     */
    List<BillPayment> findByUserIdOrderByPaymentDateDesc(Long userId);
    
    /**
     * Find payments by status for a user
     */
    List<BillPayment> findByUserIdAndStatusOrderByPaymentDateDesc(Long userId, BillPayment.PaymentStatus status);
    
    /**
     * Find payments within a date range for a user
     */
    @Query("SELECT bp FROM BillPayment bp WHERE bp.userId = :userId AND bp.paymentDate BETWEEN :startDate AND :endDate ORDER BY bp.paymentDate DESC")
    List<BillPayment> findPaymentsInDateRange(@Param("userId") Long userId, 
                                            @Param("startDate") LocalDate startDate, 
                                            @Param("endDate") LocalDate endDate);
    
    /**
     * Find overdue payments (pending payments past due date)
     */
    @Query("SELECT bp FROM BillPayment bp WHERE bp.userId = :userId AND bp.status = 'PENDING' AND bp.dueDate < :today ORDER BY bp.dueDate ASC")
    List<BillPayment> findOverduePayments(@Param("userId") Long userId, @Param("today") LocalDate today);
    
    /**
     * Find the most recent payment for a specific bill
     */
    @Query("SELECT bp FROM BillPayment bp WHERE bp.billId = :billId ORDER BY bp.paymentDate DESC LIMIT 1")
    BillPayment findMostRecentPaymentForBill(@Param("billId") Long billId);
    
    /**
     * Calculate total payments for a user within a date range
     */
    @Query("SELECT COALESCE(SUM(bp.amountPaid), 0) FROM BillPayment bp WHERE bp.userId = :userId AND bp.paymentDate BETWEEN :startDate AND :endDate AND bp.status = 'PAID'")
    Double calculateTotalPaymentsInRange(@Param("userId") Long userId, 
                                       @Param("startDate") LocalDate startDate, 
                                       @Param("endDate") LocalDate endDate);
    
    /**
     * Calculate total late fees for a user within a date range
     */
    @Query("SELECT COALESCE(SUM(bp.lateFee), 0) FROM BillPayment bp WHERE bp.userId = :userId AND bp.paymentDate BETWEEN :startDate AND :endDate")
    Double calculateTotalLateFeesInRange(@Param("userId") Long userId, 
                                       @Param("startDate") LocalDate startDate, 
                                       @Param("endDate") LocalDate endDate);
    
    /**
     * Find late payments (payment date after due date)
     */
    @Query("SELECT bp FROM BillPayment bp WHERE bp.userId = :userId AND bp.paymentDate > bp.dueDate ORDER BY bp.paymentDate DESC")
    List<BillPayment> findLatePayments(@Param("userId") Long userId);
    
    /**
     * Count payments by status for a user
     */
    long countByUserIdAndStatus(Long userId, BillPayment.PaymentStatus status);
    
    /**
     * Find payments by payment method for a user
     */
    List<BillPayment> findByUserIdAndPaymentMethodOrderByPaymentDateDesc(Long userId, BillPayment.PaymentMethod paymentMethod);
    
    /**
     * Calculate average payment amount for a bill
     */
    @Query("SELECT AVG(bp.amountPaid) FROM BillPayment bp WHERE bp.billId = :billId AND bp.status = 'PAID'")
    Double calculateAveragePaymentForBill(@Param("billId") Long billId);
    
    /**
     * Find payments for a specific bill within a date range
     */
    @Query("SELECT bp FROM BillPayment bp WHERE bp.billId = :billId AND bp.paymentDate BETWEEN :startDate AND :endDate ORDER BY bp.paymentDate DESC")
    List<BillPayment> findBillPaymentsInDateRange(@Param("billId") Long billId, 
                                                 @Param("startDate") LocalDate startDate, 
                                                 @Param("endDate") LocalDate endDate);
    
    /**
     * Find auto-pay payments for a user
     */
    List<BillPayment> findByUserIdAndIsAutoPayTrueOrderByPaymentDateDesc(Long userId);
}