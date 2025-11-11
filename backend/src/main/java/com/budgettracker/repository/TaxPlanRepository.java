package com.budgettracker.repository;

import com.budgettracker.model.TaxPlan;
import com.budgettracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaxPlanRepository extends JpaRepository<TaxPlan, Long> {
    
    // Find all tax plans for a user
    List<TaxPlan> findByUserOrderByTaxYearDesc(User user);
    
    // Find tax plan by user and year
    Optional<TaxPlan> findByUserAndTaxYear(User user, Integer taxYear);
    
    // Find tax plan by user and id
    Optional<TaxPlan> findByUserAndId(User user, Long id);
    
    // Find most recent tax plan for user
    @Query("SELECT tp FROM TaxPlan tp WHERE tp.user = :user ORDER BY tp.taxYear DESC, tp.updatedAt DESC")
    Optional<TaxPlan> findMostRecentByUser(@Param("user") User user);
    
    // Find tax plans by year range
    @Query("SELECT tp FROM TaxPlan tp WHERE tp.user = :user AND tp.taxYear BETWEEN :startYear AND :endYear ORDER BY tp.taxYear DESC")
    List<TaxPlan> findByUserAndTaxYearBetween(@Param("user") User user, @Param("startYear") Integer startYear, @Param("endYear") Integer endYear);
    
    // Count tax plans for user
    long countByUser(User user);
    
    // Delete tax plan by user and id
    void deleteByUserAndId(User user, Long id);
    
    // Check if tax plan exists for user and year
    boolean existsByUserAndTaxYear(User user, Integer taxYear);
}