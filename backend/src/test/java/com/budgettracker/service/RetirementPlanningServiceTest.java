package com.budgettracker.service;

import com.budgettracker.dto.RetirementCalculationResponse;
import com.budgettracker.dto.RetirementPlanRequest;
import com.budgettracker.model.RetirementPlan;
import com.budgettracker.model.User;
import com.budgettracker.repository.RetirementPlanRepository;
import com.budgettracker.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RetirementPlanningServiceTest {

    @Mock
    private RetirementPlanRepository retirementPlanRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private RetirementPlanningService retirementPlanningService;

    private User testUser;
    private RetirementPlanRequest testRequest;
    private RetirementPlan testPlan;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");

        testRequest = new RetirementPlanRequest();
        testRequest.setCurrentAge(30);
        testRequest.setRetirementAge(65);
        testRequest.setCurrentAnnualIncome(new BigDecimal("75000"));
        testRequest.setDesiredReplacementRatio(new BigDecimal("0.8"));
        testRequest.setCurrent401kBalance(new BigDecimal("25000"));
        testRequest.setCurrentIraBalance(new BigDecimal("15000"));
        testRequest.setOtherRetirementSavings(new BigDecimal("10000"));
        testRequest.setMonthly401kContribution(new BigDecimal("500"));
        testRequest.setMonthlyIraContribution(new BigDecimal("300"));
        testRequest.setEmployerMatchRate(new BigDecimal("0.5"));
        testRequest.setEmployerMatchLimit(new BigDecimal("0.06"));
        testRequest.setExpectedAnnualReturn(new BigDecimal("0.07"));
        testRequest.setExpectedInflationRate(new BigDecimal("0.03"));
        testRequest.setSocialSecurityBenefit(new BigDecimal("2000"));
        testRequest.setLifeExpectancy(85);

        testPlan = new RetirementPlan(testUser, 30, 65);
        testPlan.setId(1L);
        testPlan.setCurrentAnnualIncome(new BigDecimal("75000"));
        testPlan.setDesiredReplacementRatio(new BigDecimal("0.8"));
        testPlan.setCurrent401kBalance(new BigDecimal("25000"));
        testPlan.setCurrentIraBalance(new BigDecimal("15000"));
        testPlan.setOtherRetirementSavings(new BigDecimal("10000"));
        testPlan.setMonthly401kContribution(new BigDecimal("500"));
        testPlan.setMonthlyIraContribution(new BigDecimal("300"));
        testPlan.setEmployerMatchRate(new BigDecimal("0.5"));
        testPlan.setEmployerMatchLimit(new BigDecimal("0.06"));
        testPlan.setExpectedAnnualReturn(new BigDecimal("0.07"));
        testPlan.setExpectedInflationRate(new BigDecimal("0.03"));
        testPlan.setSocialSecurityBenefit(new BigDecimal("2000"));
        testPlan.setLifeExpectancy(85);
    }

    @Test
    void testCreateRetirementPlan() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(retirementPlanRepository.save(any(RetirementPlan.class))).thenReturn(testPlan);

        RetirementPlan result = retirementPlanningService.createOrUpdateRetirementPlan(1L, testRequest);

        assertNotNull(result);
        assertEquals(testPlan.getId(), result.getId());
        assertEquals(testPlan.getCurrentAge(), result.getCurrentAge());
        assertEquals(testPlan.getRetirementAge(), result.getRetirementAge());
        verify(retirementPlanRepository).save(any(RetirementPlan.class));
    }

    @Test
    void testCreateRetirementPlanUserNotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> {
            retirementPlanningService.createOrUpdateRetirementPlan(1L, testRequest);
        });
    }

    @Test
    void testCalculateRetirementProjection() {
        when(retirementPlanRepository.findById(1L)).thenReturn(Optional.of(testPlan));

        RetirementCalculationResponse result = retirementPlanningService.calculateRetirementProjection(1L);

        assertNotNull(result);
        assertEquals(testPlan.getId(), result.getPlanId());
        assertNotNull(result.getProjectedRetirementBalance());
        assertNotNull(result.getMonthlyRetirementIncome());
        assertNotNull(result.getRequiredMonthlyIncome());
        assertNotNull(result.getReplacementRatio());
        assertNotNull(result.getRetirementReadiness());
        assertNotNull(result.getBreakdown());
        assertNotNull(result.getYearlyProjections());
        
        // Verify projections list has correct number of years (35 years + current year)
        assertEquals(36, result.getYearlyProjections().size());
    }

    @Test
    void testCalculateRetirementProjectionPlanNotFound() {
        when(retirementPlanRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> {
            retirementPlanningService.calculateRetirementProjection(1L);
        });
    }

    @Test
    void testCalculateRetirementProjectionWithPlan() {
        RetirementCalculationResponse result = retirementPlanningService.calculateRetirementProjection(testPlan);

        assertNotNull(result);
        assertTrue(result.getProjectedRetirementBalance().compareTo(BigDecimal.ZERO) > 0);
        assertTrue(result.getMonthlyRetirementIncome().compareTo(BigDecimal.ZERO) > 0);
        assertTrue(result.getRequiredMonthlyIncome().compareTo(BigDecimal.ZERO) > 0);
        assertTrue(result.getReplacementRatio().compareTo(BigDecimal.ZERO) > 0);
        
        // Test retirement readiness assessment
        assertNotNull(result.getRetirementReadiness());
        assertTrue(result.getRetirementReadiness().matches("ON_TRACK|NEEDS_IMPROVEMENT|BEHIND"));
        
        // Test breakdown
        RetirementCalculationResponse.RetirementBreakdown breakdown = result.getBreakdown();
        assertNotNull(breakdown);
        assertTrue(breakdown.getTotal401kBalance().compareTo(BigDecimal.ZERO) > 0);
        assertTrue(breakdown.getTotalIraBalance().compareTo(BigDecimal.ZERO) > 0);
        assertTrue(breakdown.getTotalOtherSavings().compareTo(BigDecimal.ZERO) > 0);
    }

    @Test
    void testCompoundGrowthCalculation() {
        // Test the compound growth calculation indirectly through retirement projection
        RetirementPlan simplePlan = new RetirementPlan(testUser, 30, 65);
        simplePlan.setCurrent401kBalance(new BigDecimal("10000"));
        simplePlan.setMonthly401kContribution(new BigDecimal("500"));
        simplePlan.setExpectedAnnualReturn(new BigDecimal("0.07"));
        simplePlan.setCurrentAnnualIncome(new BigDecimal("60000"));
        simplePlan.setDesiredReplacementRatio(new BigDecimal("0.8"));
        simplePlan.setLifeExpectancy(85);

        RetirementCalculationResponse result = retirementPlanningService.calculateRetirementProjection(simplePlan);

        // With 35 years of growth, the balance should be significantly higher than initial + contributions
        BigDecimal totalContributions = new BigDecimal("500").multiply(new BigDecimal("35")).multiply(new BigDecimal("12"));
        BigDecimal expectedMinimum = new BigDecimal("10000").add(totalContributions);
        
        assertTrue(result.getProjectedRetirementBalance().compareTo(expectedMinimum) > 0,
                "Projected balance should be higher than initial balance plus contributions due to compound growth");
    }

    @Test
    void testEmployerMatchCalculation() {
        // Test with employer match
        RetirementPlan planWithMatch = new RetirementPlan(testUser, 30, 65);
        planWithMatch.setCurrentAnnualIncome(new BigDecimal("60000"));
        planWithMatch.setMonthly401kContribution(new BigDecimal("300")); // 5% of monthly income
        planWithMatch.setEmployerMatchRate(new BigDecimal("1.0")); // 100% match
        planWithMatch.setEmployerMatchLimit(new BigDecimal("0.03")); // Up to 3% of salary
        planWithMatch.setCurrent401kBalance(new BigDecimal("5000"));
        planWithMatch.setExpectedAnnualReturn(new BigDecimal("0.07"));
        planWithMatch.setDesiredReplacementRatio(new BigDecimal("0.8"));
        planWithMatch.setLifeExpectancy(85);

        RetirementCalculationResponse result = retirementPlanningService.calculateRetirementProjection(planWithMatch);

        // Employer should match $150/month (3% of $5000 monthly income)
        assertNotNull(result.getBreakdown().getTotalEmployerMatch());
        assertTrue(result.getBreakdown().getTotalEmployerMatch().compareTo(BigDecimal.ZERO) > 0);
    }

    @Test
    void testInflationAdjustment() {
        RetirementCalculationResponse result = retirementPlanningService.calculateRetirementProjection(testPlan);

        // Required monthly income should be higher than current monthly income due to inflation
        BigDecimal currentMonthlyIncome = testPlan.getCurrentAnnualIncome().divide(new BigDecimal("12"));
        BigDecimal targetMonthlyIncome = currentMonthlyIncome.multiply(testPlan.getDesiredReplacementRatio());
        
        assertTrue(result.getRequiredMonthlyIncome().compareTo(targetMonthlyIncome) > 0,
                "Required monthly income should be inflation-adjusted and higher than current target");
    }

    @Test
    void testSocialSecurityIntegration() {
        RetirementCalculationResponse result = retirementPlanningService.calculateRetirementProjection(testPlan);

        // Monthly retirement income should include Social Security benefit
        assertTrue(result.getMonthlyRetirementIncome().compareTo(testPlan.getSocialSecurityBenefit()) >= 0,
                "Monthly retirement income should at least include Social Security benefit");
        
        assertEquals(testPlan.getSocialSecurityBenefit(), result.getBreakdown().getSocialSecurityValue());
    }

    @Test
    void testYearlyProjections() {
        RetirementCalculationResponse result = retirementPlanningService.calculateRetirementProjection(testPlan);

        assertNotNull(result.getYearlyProjections());
        assertFalse(result.getYearlyProjections().isEmpty());
        
        // Check first projection (current year)
        RetirementCalculationResponse.YearlyProjection firstYear = result.getYearlyProjections().get(0);
        assertEquals(Integer.valueOf(0), firstYear.getYear());
        assertEquals(testPlan.getCurrentAge(), firstYear.getAge());
        
        // Check last projection (retirement year)
        RetirementCalculationResponse.YearlyProjection lastYear = result.getYearlyProjections().get(result.getYearlyProjections().size() - 1);
        assertEquals(Integer.valueOf(35), lastYear.getYear());
        assertEquals(testPlan.getRetirementAge(), lastYear.getAge());
        
        // Verify balances grow over time
        assertTrue(lastYear.getTotalBalance().compareTo(firstYear.getTotalBalance()) > 0);
    }

    @Test
    void testGetRetirementPlanByUserId() {
        when(retirementPlanRepository.findLatestByUserId(1L)).thenReturn(Optional.of(testPlan));

        Optional<RetirementPlan> result = retirementPlanningService.getRetirementPlanByUserId(1L);

        assertTrue(result.isPresent());
        assertEquals(testPlan.getId(), result.get().getId());
    }

    @Test
    void testDeleteRetirementPlan() {
        when(retirementPlanRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(testPlan));

        assertDoesNotThrow(() -> {
            retirementPlanningService.deleteRetirementPlan(1L, 1L);
        });

        verify(retirementPlanRepository).delete(testPlan);
    }

    @Test
    void testDeleteRetirementPlanNotFound() {
        when(retirementPlanRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> {
            retirementPlanningService.deleteRetirementPlan(1L, 1L);
        });
    }
}