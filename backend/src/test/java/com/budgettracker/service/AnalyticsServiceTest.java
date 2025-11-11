package com.budgettracker.service;

import com.budgettracker.model.User;
import com.budgettracker.repository.UserRepository;
import com.budgettracker.repository.TransactionRepository;
import com.budgettracker.repository.BudgetRepository;
import com.budgettracker.repository.SavingsGoalRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private BudgetRepository budgetRepository;

    @Mock
    private SavingsGoalRepository savingsGoalRepository;

    @InjectMocks
    private AnalyticsService analyticsService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setMonthlyIncome(new BigDecimal("5000.00"));
        testUser.setCurrentSavings(new BigDecimal("10000.00"));
        testUser.setTargetExpenses(new BigDecimal("3000.00"));
    }

    @Test
    void getMonthlyTrends_WithValidUser_ShouldReturnTrendData() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        
        List<Object[]> mockTrendData = new ArrayList<>();
        mockTrendData.add(new Object[]{2024, 10, new BigDecimal("5000.00"), new BigDecimal("3000.00"), 15L});
        mockTrendData.add(new Object[]{2024, 9, new BigDecimal("4800.00"), new BigDecimal("3200.00"), 12L});
        when(transactionRepository.getMonthlyTrendData(eq(testUser), any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(mockTrendData);

        // Act
        Map<String, Object> result = analyticsService.getMonthlyTrends(6, "testuser");

        // Assert
        assertNotNull(result);
        assertTrue(result.containsKey("trends"));
        assertTrue(result.containsKey("averageIncome"));
        assertTrue(result.containsKey("averageExpenses"));
        assertTrue(result.containsKey("trendDirection"));
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> trends = (List<Map<String, Object>>) result.get("trends");
        assertEquals(2, trends.size());
        
        verify(userRepository).findByUsername("testuser");
        verify(transactionRepository).getMonthlyTrendData(eq(testUser), any(LocalDateTime.class), any(LocalDateTime.class));
    }

    @Test
    void getCategoryBreakdown_WithValidUser_ShouldReturnCategoryData() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        
        List<Object[]> mockExpenseData = new ArrayList<>();
        mockExpenseData.add(new Object[]{"Food", new BigDecimal("800.00"), 10L});
        mockExpenseData.add(new Object[]{"Transport", new BigDecimal("300.00"), 5L});
        
        List<Object[]> mockIncomeData = new ArrayList<>();
        mockIncomeData.add(new Object[]{"Salary", new BigDecimal("5000.00"), 1L});
        
        when(transactionRepository.getExpenseBreakdownInPeriod(eq(testUser), any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(mockExpenseData);
        when(transactionRepository.getIncomeBreakdownInPeriod(eq(testUser), any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(mockIncomeData);

        // Act
        LocalDateTime startDate = LocalDateTime.now().minusMonths(1);
        LocalDateTime endDate = LocalDateTime.now();
        Map<String, Object> result = analyticsService.getCategoryBreakdown("testuser", startDate, endDate);

        // Assert
        assertNotNull(result);
        assertTrue(result.containsKey("expenseCategories"));
        assertTrue(result.containsKey("incomeCategories"));
        assertTrue(result.containsKey("totalExpenses"));
        assertTrue(result.containsKey("totalIncome"));
        assertTrue(result.containsKey("topSpendingCategory"));
        
        assertEquals("Food", result.get("topSpendingCategory"));
        assertEquals(new BigDecimal("1100.00"), result.get("totalExpenses"));
        assertEquals(new BigDecimal("5000.00"), result.get("totalIncome"));
        
        verify(userRepository).findByUsername("testuser");
    }

    @Test
    void calculateFinancialHealth_WithValidUser_ShouldReturnHealthScore() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(transactionRepository.calculateTotalIncomeInPeriod(eq(testUser), any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(new BigDecimal("15000.00"));
        when(transactionRepository.calculateTotalExpensesInPeriod(eq(testUser), any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(new BigDecimal("9000.00"));
        when(budgetRepository.countByUser(testUser)).thenReturn(5L);
        when(savingsGoalRepository.countByUser(testUser)).thenReturn(3L);
        when(savingsGoalRepository.countByUserAndStatus(testUser, "COMPLETED")).thenReturn(1L);
        when(transactionRepository.countByUserAndTransactionDateAfter(eq(testUser), any(LocalDateTime.class)))
            .thenReturn(25L);

        // Act
        Map<String, Object> result = analyticsService.calculateFinancialHealth("testuser");

        // Assert
        assertNotNull(result);
        assertTrue(result.containsKey("healthScore"));
        assertTrue(result.containsKey("factorScores"));
        assertTrue(result.containsKey("recommendations"));
        assertTrue(result.containsKey("healthTrend"));
        
        Integer healthScore = (Integer) result.get("healthScore");
        assertTrue(healthScore >= 0 && healthScore <= 100);
        
        @SuppressWarnings("unchecked")
        Map<String, Integer> factorScores = (Map<String, Integer>) result.get("factorScores");
        assertTrue(factorScores.containsKey("savingsRate"));
        assertTrue(factorScores.containsKey("budgetAdherence"));
        assertTrue(factorScores.containsKey("goalProgress"));
        assertTrue(factorScores.containsKey("transactionConsistency"));
        
        verify(userRepository).findByUsername("testuser");
    }

    @Test
    void getSpendingPatternAnalysis_WithValidUser_ShouldReturnPatternData() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(transactionRepository.countByUserAndTransactionDateAfter(eq(testUser), any(LocalDateTime.class)))
            .thenReturn(20L);
        
        List<Object[]> mockCategoryData = new ArrayList<>();
        mockCategoryData.add(new Object[]{"Food", new BigDecimal("80.00"), 10L});
        mockCategoryData.add(new Object[]{"Transport", new BigDecimal("60.00"), 5L});
        when(transactionRepository.getAverageAmountByCategory(testUser)).thenReturn(mockCategoryData);
        
        List<Object[]> mockDayData = new ArrayList<>();
        mockDayData.add(new Object[]{1, new BigDecimal("200.00"), 3L}); // Sunday
        mockDayData.add(new Object[]{2, new BigDecimal("150.00"), 2L}); // Monday
        when(transactionRepository.getSpendingByDayOfWeek(testUser)).thenReturn(mockDayData);

        // Act
        Map<String, Object> result = analyticsService.getSpendingPatternAnalysis("testuser");

        // Assert
        assertNotNull(result);
        assertTrue(result.containsKey("transactionsPerWeek"));
        assertTrue(result.containsKey("categoryAverages"));
        assertTrue(result.containsKey("dayOfWeekSpending"));
        assertTrue(result.containsKey("consistencyScore"));
        assertTrue(result.containsKey("spendingTrend"));
        assertTrue(result.containsKey("topSpendingCategories"));
        
        Double transactionsPerWeek = (Double) result.get("transactionsPerWeek");
        assertEquals(5.0, transactionsPerWeek);
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> dayOfWeekSpending = (List<Map<String, Object>>) result.get("dayOfWeekSpending");
        assertEquals(2, dayOfWeekSpending.size());
        assertEquals("Sunday", dayOfWeekSpending.get(0).get("dayOfWeek"));
        
        verify(userRepository).findByUsername("testuser");
    }

    @Test
    void calculateEnhancedFinancialHealth_WithProfileData_ShouldUseProfileData() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(transactionRepository.calculateTotalIncomeInPeriod(eq(testUser), any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(new BigDecimal("12000.00"));
        when(transactionRepository.calculateTotalExpensesInPeriod(eq(testUser), any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(new BigDecimal("8000.00"));
        when(budgetRepository.countByUser(testUser)).thenReturn(5L);
        when(savingsGoalRepository.countByUser(testUser)).thenReturn(3L);
        when(savingsGoalRepository.countByUserAndStatus(testUser, "COMPLETED")).thenReturn(2L);
        when(transactionRepository.countByUserAndTransactionDateAfter(eq(testUser), any(LocalDateTime.class)))
            .thenReturn(30L);

        // Act
        Map<String, Object> result = analyticsService.calculateEnhancedFinancialHealth("testuser");

        // Assert
        assertNotNull(result);
        assertTrue(result.containsKey("healthScore"));
        assertTrue(result.containsKey("factorScores"));
        assertTrue(result.containsKey("profileDataUsed"));
        
        Boolean profileDataUsed = (Boolean) result.get("profileDataUsed");
        assertTrue(profileDataUsed);
        
        @SuppressWarnings("unchecked")
        Map<String, Integer> factorScores = (Map<String, Integer>) result.get("factorScores");
        assertTrue(factorScores.containsKey("incomeStability"));
        
        verify(userRepository).findByUsername("testuser");
    }

    @Test
    void getMonthlyTrends_WithNonExistentUser_ShouldThrowException() {
        // Arrange
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> analyticsService.getMonthlyTrends(6, "nonexistent"));
        
        assertEquals("User not found: nonexistent", exception.getMessage());
        verify(userRepository).findByUsername("nonexistent");
        verify(transactionRepository, never()).getMonthlyTrendData(any(), any(), any());
    }

    @Test
    void calculateFinancialHealth_WithException_ShouldReturnBasicHealth() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(transactionRepository.calculateTotalIncomeInPeriod(any(), any(), any()))
            .thenThrow(new RuntimeException("Database error"));

        // Act
        Map<String, Object> result = analyticsService.calculateFinancialHealth("testuser");

        // Assert
        assertNotNull(result);
        assertEquals(50, result.get("healthScore"));
        assertTrue(result.containsKey("error"));
        assertEquals("stable", result.get("healthTrend"));
        
        @SuppressWarnings("unchecked")
        List<String> recommendations = (List<String>) result.get("recommendations");
        assertFalse(recommendations.isEmpty());
        assertTrue(recommendations.get(0).contains("Unable to calculate"));
    }
}