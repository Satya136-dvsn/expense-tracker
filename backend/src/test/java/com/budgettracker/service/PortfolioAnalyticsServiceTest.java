package com.budgettracker.service;

import com.budgettracker.model.Investment;
import com.budgettracker.model.Investment.InvestmentType;
import com.budgettracker.model.User;
import com.budgettracker.repository.InvestmentRepository;
import com.budgettracker.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PortfolioAnalyticsServiceTest {

    @Mock
    private InvestmentRepository investmentRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private PortfolioAnalyticsService portfolioAnalyticsService;

    private User testUser;
    private Investment stockInvestment;
    private Investment bondInvestment;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");

        stockInvestment = new Investment();
        stockInvestment.setId(1L);
        stockInvestment.setUser(testUser);
        stockInvestment.setSymbol("AAPL");
        stockInvestment.setName("Apple Inc.");
        stockInvestment.setType(InvestmentType.STOCK);
        stockInvestment.setQuantity(new BigDecimal("10"));
        stockInvestment.setPurchasePrice(new BigDecimal("150.00"));
        stockInvestment.setCurrentPrice(new BigDecimal("160.00"));
        stockInvestment.setPurchaseDate(LocalDate.now().minusDays(30));
        stockInvestment.setLastPriceUpdate(LocalDateTime.now());

        bondInvestment = new Investment();
        bondInvestment.setId(2L);
        bondInvestment.setUser(testUser);
        bondInvestment.setSymbol("BND");
        bondInvestment.setName("Vanguard Total Bond Market ETF");
        bondInvestment.setType(InvestmentType.BOND);
        bondInvestment.setQuantity(new BigDecimal("20"));
        bondInvestment.setPurchasePrice(new BigDecimal("80.00"));
        bondInvestment.setCurrentPrice(new BigDecimal("82.00"));
        bondInvestment.setPurchaseDate(LocalDate.now().minusDays(60));
        bondInvestment.setLastPriceUpdate(LocalDateTime.now());
    }

    @Test
    void getPortfolioPerformance_ShouldCalculateCorrectMetrics() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(investmentRepository.findByUserIdOrderByPurchaseDateDesc(1L))
                .thenReturn(Arrays.asList(stockInvestment, bondInvestment));

        // Act
        Map<String, Object> result = portfolioAnalyticsService.getPortfolioPerformance("testuser");

        // Assert
        assertNotNull(result);
        
        // Total cost basis: (10 * 150) + (20 * 80) = 1500 + 1600 = 3100
        BigDecimal expectedCostBasis = new BigDecimal("3100.00");
        assertEquals(expectedCostBasis, result.get("totalCostBasis"));
        
        // Total current value: (10 * 160) + (20 * 82) = 1600 + 1640 = 3240
        BigDecimal expectedCurrentValue = new BigDecimal("3240.00");
        assertEquals(expectedCurrentValue, result.get("totalCurrentValue"));
        
        // Total gain/loss: 3240 - 3100 = 140
        BigDecimal expectedGainLoss = new BigDecimal("140.00");
        assertEquals(expectedGainLoss, result.get("totalGainLoss"));
        
        assertEquals(2, result.get("numberOfInvestments"));
    }

    @Test
    void getAssetAllocation_ShouldCalculateCorrectAllocation() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(investmentRepository.findByUserIdOrderByPurchaseDateDesc(1L))
                .thenReturn(Arrays.asList(stockInvestment, bondInvestment));

        // Act
        Map<String, Object> result = portfolioAnalyticsService.getAssetAllocation("testuser");

        // Assert
        assertNotNull(result);
        
        @SuppressWarnings("unchecked")
        Map<InvestmentType, BigDecimal> allocationByType = 
                (Map<InvestmentType, BigDecimal>) result.get("allocationByType");
        
        assertNotNull(allocationByType);
        assertEquals(new BigDecimal("1600.00"), allocationByType.get(InvestmentType.STOCK));
        assertEquals(new BigDecimal("1640.00"), allocationByType.get(InvestmentType.BOND));
        
        BigDecimal totalValue = (BigDecimal) result.get("totalValue");
        assertEquals(new BigDecimal("3240.00"), totalValue);
    }

    @Test
    void getRiskMetrics_ShouldCalculateRiskMetrics() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(investmentRepository.findByUserIdOrderByPurchaseDateDesc(1L))
                .thenReturn(Arrays.asList(stockInvestment, bondInvestment));

        // Act
        Map<String, Object> result = portfolioAnalyticsService.getRiskMetrics("testuser");

        // Assert
        assertNotNull(result);
        assertTrue(result.containsKey("diversificationScore"));
        assertTrue(result.containsKey("uniqueAssetTypes"));
        assertTrue(result.containsKey("uniqueSymbols"));
        
        assertEquals(2, result.get("uniqueAssetTypes"));
        assertEquals(2, result.get("uniqueSymbols"));
        
        Integer diversificationScore = (Integer) result.get("diversificationScore");
        assertTrue(diversificationScore > 0);
        assertTrue(diversificationScore <= 100);
    }

    @Test
    void getPerformanceBenchmark_ShouldCalculateBenchmarkComparison() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(investmentRepository.findByUserIdOrderByPurchaseDateDesc(1L))
                .thenReturn(Arrays.asList(stockInvestment, bondInvestment));

        // Act
        Map<String, Object> result = portfolioAnalyticsService.getPerformanceBenchmark("testuser");

        // Assert
        assertNotNull(result);
        assertTrue(result.containsKey("portfolioTotalReturn"));
        assertTrue(result.containsKey("sp500BenchmarkReturn"));
        
        BigDecimal sp500Return = (BigDecimal) result.get("sp500BenchmarkReturn");
        assertEquals(new BigDecimal("10.0"), sp500Return);
    }

    @Test
    void getTopPerformers_ShouldReturnTopPerformingInvestments() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(investmentRepository.findTopPerformingInvestments(1L))
                .thenReturn(Arrays.asList(stockInvestment, bondInvestment));

        // Act
        List<Map<String, Object>> result = portfolioAnalyticsService.getTopPerformers("testuser", 5);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        
        Map<String, Object> topPerformer = result.get(0);
        assertEquals("AAPL", topPerformer.get("symbol"));
        assertEquals("Apple Inc.", topPerformer.get("name"));
        assertEquals(InvestmentType.STOCK, topPerformer.get("type"));
    }

    @Test
    void getWorstPerformers_ShouldReturnWorstPerformingInvestments() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(investmentRepository.findWorstPerformingInvestments(1L))
                .thenReturn(Arrays.asList(bondInvestment, stockInvestment));

        // Act
        List<Map<String, Object>> result = portfolioAnalyticsService.getWorstPerformers("testuser", 5);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        
        Map<String, Object> worstPerformer = result.get(0);
        assertEquals("BND", worstPerformer.get("symbol"));
        assertEquals(InvestmentType.BOND, worstPerformer.get("type"));
    }

    @Test
    void getPortfolioSummary_ShouldReturnComprehensiveSummary() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(investmentRepository.findByUserIdOrderByPurchaseDateDesc(1L))
                .thenReturn(Arrays.asList(stockInvestment, bondInvestment));
        when(investmentRepository.findTopPerformingInvestments(1L))
                .thenReturn(Arrays.asList(stockInvestment, bondInvestment));
        when(investmentRepository.findWorstPerformingInvestments(1L))
                .thenReturn(Arrays.asList(bondInvestment, stockInvestment));

        // Act
        Map<String, Object> result = portfolioAnalyticsService.getPortfolioSummary("testuser");

        // Assert
        assertNotNull(result);
        assertTrue(result.containsKey("performance"));
        assertTrue(result.containsKey("allocation"));
        assertTrue(result.containsKey("riskMetrics"));
        assertTrue(result.containsKey("benchmark"));
        assertTrue(result.containsKey("topPerformers"));
        assertTrue(result.containsKey("worstPerformers"));
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> topPerformers = (List<Map<String, Object>>) result.get("topPerformers");
        assertEquals(2, topPerformers.size());
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> worstPerformers = (List<Map<String, Object>>) result.get("worstPerformers");
        assertEquals(2, worstPerformers.size());
    }

    @Test
    void getPortfolioPerformance_EmptyPortfolio_ShouldReturnZeroValues() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(investmentRepository.findByUserIdOrderByPurchaseDateDesc(1L))
                .thenReturn(Arrays.asList());

        // Act
        Map<String, Object> result = portfolioAnalyticsService.getPortfolioPerformance("testuser");

        // Assert
        assertNotNull(result);
        assertEquals(BigDecimal.ZERO, result.get("totalCostBasis"));
        assertEquals(BigDecimal.ZERO, result.get("totalCurrentValue"));
        assertEquals(BigDecimal.ZERO, result.get("totalGainLoss"));
        assertEquals(0, result.get("numberOfInvestments"));
    }

    @Test
    void getAssetAllocation_EmptyPortfolio_ShouldReturnEmptyAllocation() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(investmentRepository.findByUserIdOrderByPurchaseDateDesc(1L))
                .thenReturn(Arrays.asList());

        // Act
        Map<String, Object> result = portfolioAnalyticsService.getAssetAllocation("testuser");

        // Assert
        assertNotNull(result);
        assertEquals(BigDecimal.ZERO, result.get("totalValue"));
        
        @SuppressWarnings("unchecked")
        Map<InvestmentType, BigDecimal> allocationByType = 
                (Map<InvestmentType, BigDecimal>) result.get("allocationByType");
        assertTrue(allocationByType.isEmpty());
    }

    @Test
    void getRiskMetrics_EmptyPortfolio_ShouldReturnZeroScore() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(investmentRepository.findByUserIdOrderByPurchaseDateDesc(1L))
                .thenReturn(Arrays.asList());

        // Act
        Map<String, Object> result = portfolioAnalyticsService.getRiskMetrics("testuser");

        // Assert
        assertNotNull(result);
        assertEquals(0, result.get("diversificationScore"));
        assertEquals(0, result.get("uniqueAssetTypes"));
        assertEquals(0, result.get("uniqueSymbols"));
    }
}