package com.budgettracker.service;

import com.budgettracker.dto.DebtOptimizationRequest;
import com.budgettracker.dto.DebtOptimizationResponse;
import com.budgettracker.model.Debt;
import com.budgettracker.model.User;
import com.budgettracker.repository.DebtRepository;
import com.budgettracker.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DebtOptimizationServiceTest {

    @Mock
    private DebtRepository debtRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private DebtOptimizationService debtOptimizationService;

    private User testUser;
    private List<Debt> testDebts;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");

        // Create test debts with different balances and interest rates
        Debt creditCard = new Debt();
        creditCard.setId(1L);
        creditCard.setUser(testUser);
        creditCard.setName("Credit Card");
        creditCard.setCurrentBalance(new BigDecimal("5000"));
        creditCard.setInterestRate(new BigDecimal("0.18"));
        creditCard.setMinimumPayment(new BigDecimal("150"));
        creditCard.setStatus(Debt.DebtStatus.ACTIVE);

        Debt personalLoan = new Debt();
        personalLoan.setId(2L);
        personalLoan.setUser(testUser);
        personalLoan.setName("Personal Loan");
        personalLoan.setCurrentBalance(new BigDecimal("15000"));
        personalLoan.setInterestRate(new BigDecimal("0.12"));
        personalLoan.setMinimumPayment(new BigDecimal("300"));
        personalLoan.setStatus(Debt.DebtStatus.ACTIVE);

        Debt studentLoan = new Debt();
        studentLoan.setId(3L);
        studentLoan.setUser(testUser);
        studentLoan.setName("Student Loan");
        studentLoan.setCurrentBalance(new BigDecimal("25000"));
        studentLoan.setInterestRate(new BigDecimal("0.06"));
        studentLoan.setMinimumPayment(new BigDecimal("250"));
        studentLoan.setStatus(Debt.DebtStatus.ACTIVE);

        testDebts = Arrays.asList(creditCard, personalLoan, studentLoan);
    }

    @Test
    void testCalculateAvalancheStrategy() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(debtRepository.findByUserAndStatus(testUser, Debt.DebtStatus.ACTIVE)).thenReturn(testDebts);
        when(debtRepository.findActiveDebtsOrderedByInterestRateDesc(testUser)).thenReturn(testDebts);

        DebtOptimizationRequest request = new DebtOptimizationRequest();
        request.setExtraPaymentAmount(new BigDecimal("200"));

        // Act
        DebtOptimizationResponse response = debtOptimizationService.calculateAvalancheStrategy(request, "testuser");

        // Assert
        assertNotNull(response);
        assertEquals("AVALANCHE", response.getStrategy());
        assertEquals(new BigDecimal("45000"), response.getTotalDebt());
        assertEquals(new BigDecimal("700"), response.getTotalMinimumPayments());
        assertEquals(new BigDecimal("200"), response.getExtraPaymentAmount());
        assertNotNull(response.getPayoffPlan());
        assertEquals(3, response.getPayoffPlan().size());

        // Verify debts are ordered by interest rate (highest first)
        List<DebtOptimizationResponse.DebtPayoffPlan> payoffPlan = response.getPayoffPlan();
        assertEquals(1, payoffPlan.get(0).getPayoffOrder()); // Credit Card (18%)
        assertEquals(2, payoffPlan.get(1).getPayoffOrder()); // Personal Loan (12%)
        assertEquals(3, payoffPlan.get(2).getPayoffOrder()); // Student Loan (6%)
    }

    @Test
    void testCalculateSnowballStrategy() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(debtRepository.findByUserAndStatus(testUser, Debt.DebtStatus.ACTIVE)).thenReturn(testDebts);
        when(debtRepository.findActiveDebtsOrderedByBalanceAsc(testUser)).thenReturn(testDebts);

        DebtOptimizationRequest request = new DebtOptimizationRequest();
        request.setExtraPaymentAmount(new BigDecimal("200"));

        // Act
        DebtOptimizationResponse response = debtOptimizationService.calculateSnowballStrategy(request, "testuser");

        // Assert
        assertNotNull(response);
        assertEquals("SNOWBALL", response.getStrategy());
        assertEquals(new BigDecimal("45000"), response.getTotalDebt());
        assertNotNull(response.getPayoffPlan());
        assertEquals(3, response.getPayoffPlan().size());
    }

    @Test
    void testCompareStrategies() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(debtRepository.findByUserAndStatus(testUser, Debt.DebtStatus.ACTIVE)).thenReturn(testDebts);
        when(debtRepository.findActiveDebtsOrderedByInterestRateDesc(testUser)).thenReturn(testDebts);
        when(debtRepository.findActiveDebtsOrderedByBalanceAsc(testUser)).thenReturn(testDebts);

        DebtOptimizationRequest request = new DebtOptimizationRequest();
        request.setExtraPaymentAmount(new BigDecimal("200"));

        // Act
        DebtOptimizationResponse.DebtOptimizationComparison comparison = 
                debtOptimizationService.compareStrategies(request, "testuser");

        // Assert
        assertNotNull(comparison);
        assertNotNull(comparison.getAvalancheStrategy());
        assertNotNull(comparison.getSnowballStrategy());
        assertNotNull(comparison.getRecommendedStrategy());
        assertNotNull(comparison.getRecommendationReason());
        assertTrue(comparison.getRecommendedStrategy().equals("AVALANCHE") || 
                  comparison.getRecommendedStrategy().equals("SNOWBALL"));
    }

    @Test
    void testAnalyzeConsolidation() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(debtRepository.findByUserAndStatus(testUser, Debt.DebtStatus.ACTIVE)).thenReturn(testDebts);

        BigDecimal consolidationRate = new BigDecimal("0.08");

        // Act
        var response = debtOptimizationService.analyzeConsolidation(consolidationRate, "testuser");

        // Assert
        assertNotNull(response);
        assertEquals(new BigDecimal("45000"), response.getTotalCurrentDebt());
        assertEquals(new BigDecimal("700"), response.getTotalCurrentMinimumPayments());
        assertEquals(new BigDecimal("45000"), response.getConsolidatedLoanAmount());
        assertEquals(consolidationRate, response.getConsolidatedInterestRate());
        assertNotNull(response.getIsConsolidationBeneficial());
        assertNotNull(response.getRecommendation());
    }

    @Test
    void testComparePaymentStrategies() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(debtRepository.findByUserAndStatus(testUser, Debt.DebtStatus.ACTIVE)).thenReturn(testDebts);
        when(debtRepository.findActiveDebtsOrderedByInterestRateDesc(testUser)).thenReturn(testDebts);

        BigDecimal extraPayment = new BigDecimal("300");

        // Act
        var comparison = debtOptimizationService.comparePaymentStrategies(extraPayment, "testuser");

        // Assert
        assertNotNull(comparison);
        assertTrue(comparison.containsKey("minimumPaymentScenario"));
        assertTrue(comparison.containsKey("acceleratedPaymentScenario"));
        assertTrue(comparison.containsKey("savings"));
        assertTrue(comparison.containsKey("recommendation"));

        var minimumScenario = (java.util.Map<String, Object>) comparison.get("minimumPaymentScenario");
        var acceleratedScenario = (java.util.Map<String, Object>) comparison.get("acceleratedPaymentScenario");
        var savings = (java.util.Map<String, Object>) comparison.get("savings");

        assertNotNull(minimumScenario.get("monthlyPayment"));
        assertNotNull(acceleratedScenario.get("monthlyPayment"));
        assertNotNull(savings.get("interestSavings"));
        assertNotNull(savings.get("timeSavingsMonths"));
    }

    @Test
    void testCalculateAvalancheStrategyWithNoDebts() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(debtRepository.findByUserAndStatus(testUser, Debt.DebtStatus.ACTIVE)).thenReturn(Arrays.asList());

        DebtOptimizationRequest request = new DebtOptimizationRequest();
        request.setExtraPaymentAmount(new BigDecimal("200"));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            debtOptimizationService.calculateAvalancheStrategy(request, "testuser");
        });

        assertEquals("No active debts found for optimization", exception.getMessage());
    }

    @Test
    void testCalculateAvalancheStrategyWithUserNotFound() {
        // Arrange
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        DebtOptimizationRequest request = new DebtOptimizationRequest();
        request.setExtraPaymentAmount(new BigDecimal("200"));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            debtOptimizationService.calculateAvalancheStrategy(request, "nonexistent");
        });

        assertEquals("User not found", exception.getMessage());
    }

    @Test
    void testCalculateAvalancheStrategyWithSpecificDebts() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        
        List<Debt> specificDebts = Arrays.asList(testDebts.get(0), testDebts.get(1)); // Only first two debts
        when(debtRepository.findByUserAndIdIn(eq(testUser), any())).thenReturn(specificDebts);
        when(debtRepository.findSpecificDebtsOrderedByInterestRateDesc(eq(testUser), any())).thenReturn(specificDebts);

        DebtOptimizationRequest request = new DebtOptimizationRequest();
        request.setExtraPaymentAmount(new BigDecimal("200"));
        request.setDebtIds(Arrays.asList(1L, 2L));

        // Act
        DebtOptimizationResponse response = debtOptimizationService.calculateAvalancheStrategy(request, "testuser");

        // Assert
        assertNotNull(response);
        assertEquals("AVALANCHE", response.getStrategy());
        assertEquals(2, response.getPayoffPlan().size());
        
        verify(debtRepository).findSpecificDebtsOrderedByInterestRateDesc(testUser, Arrays.asList(1L, 2L));
    }

    @Test
    void testConsolidationBeneficial() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(debtRepository.findByUserAndStatus(testUser, Debt.DebtStatus.ACTIVE)).thenReturn(testDebts);

        // Use a very low consolidation rate that should be beneficial
        BigDecimal consolidationRate = new BigDecimal("0.03");

        // Act
        var response = debtOptimizationService.analyzeConsolidation(consolidationRate, "testuser");

        // Assert
        assertNotNull(response);
        assertTrue(response.getIsConsolidationBeneficial());
        assertTrue(response.getTotalInterestSavings().compareTo(BigDecimal.ZERO) > 0);
        assertNotNull(response.getBenefits());
        assertTrue(response.getBenefits().size() > 0);
    }

    @Test
    void testConsolidationNotBeneficial() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(debtRepository.findByUserAndStatus(testUser, Debt.DebtStatus.ACTIVE)).thenReturn(testDebts);

        // Use a high consolidation rate that should not be beneficial
        BigDecimal consolidationRate = new BigDecimal("0.25");

        // Act
        var response = debtOptimizationService.analyzeConsolidation(consolidationRate, "testuser");

        // Assert
        assertNotNull(response);
        assertFalse(response.getIsConsolidationBeneficial());
        assertNotNull(response.getConsiderations());
        assertTrue(response.getConsiderations().size() > 0);
    }

    @Test
    void testPaymentComparisonShowsSavings() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(debtRepository.findByUserAndStatus(testUser, Debt.DebtStatus.ACTIVE)).thenReturn(testDebts);
        when(debtRepository.findActiveDebtsOrderedByInterestRateDesc(testUser)).thenReturn(testDebts);

        BigDecimal extraPayment = new BigDecimal("500");

        // Act
        var comparison = debtOptimizationService.comparePaymentStrategies(extraPayment, "testuser");

        // Assert
        var savings = (java.util.Map<String, Object>) comparison.get("savings");
        BigDecimal interestSavings = (BigDecimal) savings.get("interestSavings");
        Integer timeSavings = (Integer) savings.get("timeSavingsMonths");

        assertTrue(interestSavings.compareTo(BigDecimal.ZERO) > 0);
        assertTrue(timeSavings > 0);
    }
}