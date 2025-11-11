package com.budgettracker.repository;

import com.budgettracker.model.Investment;
import com.budgettracker.model.Investment.InvestmentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvestmentRepository extends JpaRepository<Investment, Long> {
    
    // Find all investments for a user
    List<Investment> findByUserIdOrderByPurchaseDateDesc(Long userId);
    
    // Find investments by type for a user
    List<Investment> findByUserIdAndTypeOrderByPurchaseDateDesc(Long userId, InvestmentType type);
    
    // Find investment by user and symbol
    Optional<Investment> findByUserIdAndSymbol(Long userId, String symbol);
    
    // Find all unique symbols for a user
    @Query("SELECT DISTINCT i.symbol FROM Investment i WHERE i.user.id = :userId")
    List<String> findDistinctSymbolsByUserId(@Param("userId") Long userId);
    
    // Calculate total investment value for a user
    @Query("SELECT COALESCE(SUM(i.quantity * COALESCE(i.currentPrice, i.purchasePrice)), 0) " +
           "FROM Investment i WHERE i.user.id = :userId")
    BigDecimal calculateTotalPortfolioValue(@Param("userId") Long userId);
    
    // Calculate total cost basis for a user
    @Query("SELECT COALESCE(SUM(i.quantity * i.purchasePrice), 0) " +
           "FROM Investment i WHERE i.user.id = :userId")
    BigDecimal calculateTotalCostBasis(@Param("userId") Long userId);
    
    // Get portfolio allocation by type
    @Query("SELECT i.type, COALESCE(SUM(i.quantity * COALESCE(i.currentPrice, i.purchasePrice)), 0) " +
           "FROM Investment i WHERE i.user.id = :userId GROUP BY i.type")
    List<Object[]> getPortfolioAllocationByType(@Param("userId") Long userId);
    
    // Find investments purchased within date range
    List<Investment> findByUserIdAndPurchaseDateBetweenOrderByPurchaseDateDesc(
            Long userId, LocalDate startDate, LocalDate endDate);
    
    // Find investments with outdated prices (older than specified hours)
    @Query("SELECT i FROM Investment i WHERE " +
           "(i.lastPriceUpdate IS NULL OR i.lastPriceUpdate < :cutoffTime)")
    List<Investment> findInvestmentsWithOutdatedPrices(@Param("cutoffTime") java.time.LocalDateTime cutoffTime);
    
    // Find investments with outdated prices for a specific user
    @Query("SELECT i FROM Investment i WHERE i.user.id = :userId AND " +
           "(i.lastPriceUpdate IS NULL OR i.lastPriceUpdate < :cutoffTime)")
    List<Investment> findInvestmentsWithOutdatedPricesByUserId(@Param("userId") Long userId, 
                                                              @Param("cutoffTime") java.time.LocalDateTime cutoffTime);
    
    // Get top performing investments
    @Query("SELECT i FROM Investment i WHERE i.user.id = :userId AND i.currentPrice IS NOT NULL " +
           "ORDER BY ((i.currentPrice - i.purchasePrice) / i.purchasePrice) DESC")
    List<Investment> findTopPerformingInvestments(@Param("userId") Long userId);
    
    // Get worst performing investments
    @Query("SELECT i FROM Investment i WHERE i.user.id = :userId AND i.currentPrice IS NOT NULL " +
           "ORDER BY ((i.currentPrice - i.purchasePrice) / i.purchasePrice) ASC")
    List<Investment> findWorstPerformingInvestments(@Param("userId") Long userId);
    
    // Count investments by type for a user
    @Query("SELECT i.type, COUNT(i) FROM Investment i WHERE i.user.id = :userId GROUP BY i.type")
    List<Object[]> countInvestmentsByType(@Param("userId") Long userId);
    
    // Find investments by brokerage
    List<Investment> findByUserIdAndBrokerageOrderByPurchaseDateDesc(Long userId, String brokerage);
    
    // Get all unique brokerages for a user
    @Query("SELECT DISTINCT i.brokerage FROM Investment i WHERE i.user.id = :userId AND i.brokerage IS NOT NULL")
    List<String> findDistinctBrokeragesByUserId(@Param("userId") Long userId);
}