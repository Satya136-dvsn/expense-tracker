package com.budgettracker.service;

import com.budgettracker.dto.TaxCalculationResponse;
import com.budgettracker.dto.TaxPlanRequest;
import com.budgettracker.model.TaxPlan;
import com.budgettracker.model.User;
import com.budgettracker.repository.TaxPlanRepository;
import com.budgettracker.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaxPlanningServiceTest {

    @Mock
    private TaxPlanRepository taxPlanRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TaxPlanningService taxPlanningService;

    private User testUser;
    private TaxPlan testTaxPlan;
    private TaxPlanRequest testRequest;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");

        testTaxPlan = new TaxPlan();
        testTaxPlan.setId(1L);
        testTaxPlan.setUser(testUser);
        testTaxPlan.setTaxYear(2024);
        testTaxPlan.setFilingStatus(TaxPlan.FilingStatus.SINGLE);
        testTaxPlan.setAnnualIncome(new BigDecimal("75000"));
        testTaxPlan.setFederalWithholding(new BigDecimal("12000"));
        testTaxPlan.setStateWithholding(new BigDecimal("3000"));
        testTaxPlan.setTraditional401kContribution(new BigDecimal("10000"));
        testTaxPlan.setTraditionalIraContribution(new BigDecimal("6000"));
        testTaxPlan.setHsaContribution(new BigDecimal("3000"));
        testTaxPlan.setMortgageInterest(new BigDecimal("8000"));
        testTaxPlan.setStateLocalTaxes(new BigDecimal("10000"));
        testTaxPlan.setCharitableContributions(new BigDecimal("2000"));

        testRequest = new TaxPlanRequest();
        testRequest.setTaxYear(2024);
        testRequest.setFilingStatus(TaxPlan.FilingStatus.SINGLE);
        testRequest.setAnnualIncome(new BigDecimal("75000"));
        testRequest.setFederalWithholding(new BigDecimal("12000"));
        testRequest.setStateWithholding(new BigDecimal("3000"));
        testRequest.setTraditional401kContribution(new BigDecimal("10000"));
        testRequest.setTraditionalIraContribution(new BigDecimal("6000"));
        testRequest.setHsaContribution(new BigDecimal("3000"));
        testRequest.setMortgageInterest(new BigDecimal("8000"));
        testRequest.setStateLocalTaxes(new BigDecimal("10000"));
        testRequest.setCharitableContributions(new BigDecimal("2000"));
    }

    @Test
    void testCreateOrUpdateTaxPlan() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(taxPlanRepository.findByUserAndTaxYear(testUser, 2024)).thenReturn(Optional.empty());
        when(taxPlanRepository.save(any(TaxPlan.class))).thenReturn(testTaxPlan);

        // Act
        TaxPlan result = taxPlanningService.createOrUpdateTaxPlan(testRequest, "testuser");

        // Assert
        assertNotNull(result);
        assertEquals(testTaxPlan.getId(), result.getId());
        verify(taxPlanRepository).save(any(TaxPlan.class));
    }

    @Test
    void testUpdateExistingTaxPlan() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(taxPlanRepository.findByUserAndTaxYear(testUser, 2024)).thenReturn(Optional.of(testTaxPlan));
        when(taxPlanRepository.save(any(TaxPlan.class))).thenReturn(testTaxPlan);

        // Act
        TaxPlan result = taxPlanningService.createOrUpdateTaxPlan(testRequest, "testuser");

        // Assert
        assertNotNull(result);
        verify(taxPlanRepository).save(testTaxPlan);
    }

    @Test
    void testCalculateTaxes() {
        // Act
        TaxCalculationResponse response = taxPlanningService.calculateTaxes(testTaxPlan);

        // Assert
        assertNotNull(response);
        assertEquals(Integer.valueOf(2024), response.getTaxYear());
        assertEquals("SINGLE", response.getFilingStatus());
        assertEquals(new BigDecimal("75000"), response.getAnnualIncome());
        assertNotNull(response.getAdjustedGrossIncome());
        assertNotNull(response.getTaxableIncome());
        assertNotNull(response.getFederalTaxOwed());
        assertNotNull(response.getStateTaxOwed());
        assertNotNull(response.getTotalTaxOwed());
        assertNotNull(response.getEffectiveTaxRate());
        assertNotNull(response.getMarginalTaxRate());
        assertNotNull(response.getRefundOrAmountDue());
        assertNotNull(response.getIsRefund());
    }

    @Test
    void testCalculateTaxesWithItemizedDeductions() {
        // Arrange - Set up scenario where itemized deductions exceed standard deduction
        testTaxPlan.setMortgageInterest(new BigDecimal("15000"));
        testTaxPlan.setStateLocalTaxes(new BigDecimal("10000"));
        testTaxPlan.setCharitableContributions(new BigDecimal("5000"));

        // Act
        TaxCalculationResponse response = taxPlanningService.calculateTaxes(testTaxPlan);

        // Assert
        assertNotNull(response);
        assertTrue(response.getShouldItemize());
        assertTrue(response.getItemizedDeductions().compareTo(response.getStandardDeduction()) > 0);
        assertEquals(response.getItemizedDeductions(), response.getTotalDeductions());
    }

    @Test
    void testCalculateTaxesWithStandardDeduction() {
        // Arrange - Set up scenario where standard deduction is better
        testTaxPlan.setMortgageInterest(new BigDecimal("2000"));
        testTaxPlan.setStateLocalTaxes(new BigDecimal("3000"));
        testTaxPlan.setCharitableContributions(new BigDecimal("1000"));

        // Act
        TaxCalculationResponse response = taxPlanningService.calculateTaxes(testTaxPlan);

        // Assert
        assertNotNull(response);
        assertFalse(response.getShouldItemize());
        assertEquals(response.getStandardDeduction(), response.getTotalDeductions());
    }

    @Test
    void testCalculateTaxBrackets() {
        // Arrange
        BigDecimal income = new BigDecimal("75000");
        TaxPlan.FilingStatus filingStatus = TaxPlan.FilingStatus.SINGLE;

        // Act
        TaxCalculationResponse response = taxPlanningService.calculateTaxBrackets(income, filingStatus);

        // Assert
        assertNotNull(response);
        assertNotNull(response.getFederalTaxBrackets());
        assertTrue(response.getFederalTaxBrackets().size() > 0);
        assertNotNull(response.getEffectiveTaxRate());
        assertNotNull(response.getMarginalTaxRate());
        assertNotNull(response.getFederalTaxOwed());
    }

    @Test
    void testOptimizeContributions() {
        // Arrange
        BigDecimal income = new BigDecimal("100000");
        TaxPlan.FilingStatus filingStatus = TaxPlan.FilingStatus.SINGLE;
        Integer age = 35;

        // Act
        Map<String, Object> optimization = taxPlanningService.optimizeContributions(income, filingStatus, age);

        // Assert
        assertNotNull(optimization);
        assertTrue(optimization.containsKey("optimalContributions"));
        assertTrue(optimization.containsKey("taxSavings"));
        assertTrue(optimization.containsKey("totalOptimalContributions"));
        assertTrue(optimization.containsKey("totalTaxSavings"));
        assertTrue(optimization.containsKey("marginalTaxRate"));

        @SuppressWarnings("unchecked")
        Map<String, BigDecimal> optimalContributions = (Map<String, BigDecimal>) optimization.get("optimalContributions");
        assertTrue(optimalContributions.containsKey("401k"));
        assertTrue(optimalContributions.containsKey("traditionalIRA"));
        assertTrue(optimalContributions.containsKey("hsa"));

        // Verify contribution limits for under 50
        assertEquals(new BigDecimal("22500"), optimalContributions.get("401k"));
        assertEquals(new BigDecimal("6000"), optimalContributions.get("traditionalIRA"));
        assertEquals(new BigDecimal("3650"), optimalContributions.get("hsa"));
    }

    @Test
    void testOptimizeContributionsOver50() {
        // Arrange
        BigDecimal income = new BigDecimal("100000");
        TaxPlan.FilingStatus filingStatus = TaxPlan.FilingStatus.SINGLE;
        Integer age = 55;

        // Act
        Map<String, Object> optimization = taxPlanningService.optimizeContributions(income, filingStatus, age);

        // Assert
        @SuppressWarnings("unchecked")
        Map<String, BigDecimal> optimalContributions = (Map<String, BigDecimal>) optimization.get("optimalContributions");

        // Verify catch-up contributions for over 50
        assertEquals(new BigDecimal("30000"), optimalContributions.get("401k")); // 22500 + 7500 catch-up
        assertEquals(new BigDecimal("7000"), optimalContributions.get("traditionalIRA")); // 6000 + 1000 catch-up
        assertEquals(new BigDecimal("4650"), optimalContributions.get("hsa")); // 3650 + 1000 catch-up (55+)
    }

    @Test
    void testCalculateTaxLossHarvesting() {
        // Arrange
        BigDecimal capitalGains = new BigDecimal("10000");
        BigDecimal capitalLosses = new BigDecimal("15000");
        BigDecimal marginalTaxRate = new BigDecimal("0.22");

        // Act
        Map<String, Object> analysis = taxPlanningService.calculateTaxLossHarvesting(
                capitalGains, capitalLosses, marginalTaxRate);

        // Assert
        assertNotNull(analysis);
        assertTrue(analysis.containsKey("netCapitalGains"));
        assertTrue(analysis.containsKey("ordinaryIncomeOffset"));
        assertTrue(analysis.containsKey("carryForwardLoss"));
        assertTrue(analysis.containsKey("taxSavings"));
        assertTrue(analysis.containsKey("recommendation"));

        BigDecimal netGains = (BigDecimal) analysis.get("netCapitalGains");
        assertEquals(new BigDecimal("-5000"), netGains); // 10000 - 15000

        BigDecimal ordinaryOffset = (BigDecimal) analysis.get("ordinaryIncomeOffset");
        assertEquals(new BigDecimal("3000"), ordinaryOffset); // Limited to $3000

        BigDecimal carryForward = (BigDecimal) analysis.get("carryForwardLoss");
        assertEquals(new BigDecimal("2000"), carryForward); // 5000 - 3000
    }

    @Test
    void testCalculateTaxLossHarvestingWithGains() {
        // Arrange
        BigDecimal capitalGains = new BigDecimal("15000");
        BigDecimal capitalLosses = new BigDecimal("5000");
        BigDecimal marginalTaxRate = new BigDecimal("0.22");

        // Act
        Map<String, Object> analysis = taxPlanningService.calculateTaxLossHarvesting(
                capitalGains, capitalLosses, marginalTaxRate);

        // Assert
        assertNotNull(analysis);
        
        BigDecimal netGains = (BigDecimal) analysis.get("netCapitalGains");
        assertEquals(new BigDecimal("10000"), netGains); // 15000 - 5000

        assertTrue(analysis.containsKey("capitalGainsTaxOwed"));
        BigDecimal capitalGainsTax = (BigDecimal) analysis.get("capitalGainsTaxOwed");
        assertTrue(capitalGainsTax.compareTo(BigDecimal.ZERO) > 0);
    }

    @Test
    void testCreateTaxPlanWithUserNotFound() {
        // Arrange
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            taxPlanningService.createOrUpdateTaxPlan(testRequest, "nonexistent");
        });

        assertEquals("User not found", exception.getMessage());
    }

    @Test
    void testCalculateTaxesGeneratesOptimizationSuggestions() {
        // Arrange - Set up a scenario that should generate suggestions
        testTaxPlan.setTraditional401kContribution(new BigDecimal("5000")); // Below max
        testTaxPlan.setHsaContribution(BigDecimal.ZERO); // No HSA contribution

        // Act
        TaxCalculationResponse response = taxPlanningService.calculateTaxes(testTaxPlan);

        // Assert
        assertNotNull(response.getOptimizationSuggestions());
        assertTrue(response.getOptimizationSuggestions().size() > 0);
        
        // Should suggest maximizing 401k and HSA contributions
        boolean has401kSuggestion = response.getOptimizationSuggestions().stream()
                .anyMatch(suggestion -> suggestion.getCategory().equals("Retirement"));
        boolean hasHsaSuggestion = response.getOptimizationSuggestions().stream()
                .anyMatch(suggestion -> suggestion.getCategory().equals("Healthcare"));
        
        assertTrue(has401kSuggestion || hasHsaSuggestion);
    }

    @Test
    void testCalculateTaxesWithRefund() {
        // Arrange - Set up scenario where withholding exceeds tax owed
        testTaxPlan.setFederalWithholding(new BigDecimal("20000"));
        testTaxPlan.setStateWithholding(new BigDecimal("5000"));

        // Act
        TaxCalculationResponse response = taxPlanningService.calculateTaxes(testTaxPlan);

        // Assert
        assertTrue(response.getIsRefund());
        assertTrue(response.getRefundOrAmountDue().compareTo(BigDecimal.ZERO) > 0);
    }

    @Test
    void testCalculateTaxesWithAmountDue() {
        // Arrange - Set up scenario where tax owed exceeds withholding
        testTaxPlan.setFederalWithholding(new BigDecimal("2000"));
        testTaxPlan.setStateWithholding(new BigDecimal("500"));

        // Act
        TaxCalculationResponse response = taxPlanningService.calculateTaxes(testTaxPlan);

        // Assert
        assertFalse(response.getIsRefund());
        assertTrue(response.getRefundOrAmountDue().compareTo(BigDecimal.ZERO) > 0);
    }

    @Test
    void testTaxAdvantageAnalysis() {
        // Act
        TaxCalculationResponse response = taxPlanningService.calculateTaxes(testTaxPlan);

        // Assert
        assertNotNull(response.getTaxAdvantageAnalysis());
        
        TaxCalculationResponse.TaxAdvantageAnalysis analysis = response.getTaxAdvantageAnalysis();
        assertNotNull(analysis.getCurrentContributions());
        assertNotNull(analysis.getMaxContributions());
        assertNotNull(analysis.getRemainingContributionRoom());
        assertNotNull(analysis.getTotalTaxSavingsFromContributions());

        assertTrue(analysis.getCurrentContributions().containsKey("401k"));
        assertTrue(analysis.getCurrentContributions().containsKey("traditionalIRA"));
        assertTrue(analysis.getCurrentContributions().containsKey("hsa"));
    }
}