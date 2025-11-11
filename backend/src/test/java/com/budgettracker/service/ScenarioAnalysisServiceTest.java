package com.budgettracker.service;

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
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ScenarioAnalysisServiceTest {

    @Mock
    private RetirementPlanRepository retirementPlanRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ScenarioAnalysisService scenarioAnalysisService;

    private User testUser;
    private RetirementPlan testRetirementPlan;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");

        testRetirementPlan = new RetirementPlan();
        testRetirementPlan.setId(1L);
        testRetirementPlan.setUser(testUser);
        testRetirementPlan.setCurrentAge(30);
        testRetirementPlan.setRetirementAge(65);
        testRetirementPlan.setCurrentAnnualIncome(new BigDecimal("75000"));
        testRetirementPlan.setDesiredReplacementRatio(new BigDecimal("0.8"));
        testRetirementPlan.setCurrent401kBalance(new BigDecimal("25000"));
        testRetirementPlan.setCurrentIraBalance(new BigDecimal("15000"));
        testRetirementPlan.setOtherRetirementSavings(new BigDecimal("10000"));
        testRetirementPlan.setMonthly401kContribution(new BigDecimal("500"));
        testRetirementPlan.setMonthlyIraContribution(new BigDecimal("300"));
        testRetirementPlan.setEmployerMatchRate(new BigDecimal("0.5"));
        testRetirementPlan.setEmployerMatchLimit(new BigDecimal("0.06"));
        testRetirementPlan.setExpectedAnnualReturn(new BigDecimal("0.07"));
        testRetirementPlan.setExpectedInflationRate(new BigDecimal("0.03"));
        testRetirementPlan.setSocialSecurityBenefit(new BigDecimal("2000"));
        testRetirementPlan.setLifeExpectancy(85);
    }

    @Test
    void testPerformWhatIfAnalysis() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(retirementPlanRepository.findLatestByUserId(testUser.getId())).thenReturn(Optional.of(testRetirementPlan));

        Map<String, Object> scenarios = new HashMap<>();
        scenarios.put("optimistic", Map.of("returnRate", 0.10));
        scenarios.put("pessimistic", Map.of("returnRate", 0.04));
        scenarios.put("earlyRetirement", Map.of("retirementAge", 60));

        // Act
        Map<String, Object> results = scenarioAnalysisService.performWhatIfAnalysis("testuser", scenarios);

        // Assert
        assertNotNull(results);
        assertTrue(results.containsKey("baseScenario"));
        assertTrue(results.containsKey("alternativeScenarios"));
        assertTrue(results.containsKey("summary"));

        @SuppressWarnings("unchecked")
        Map<String, Object> baseScenario = (Map<String, Object>) results.get("baseScenario");
        assertNotNull(baseScenario.get("finalBalance"));
        assertNotNull(baseScenario.get("monthlyIncome"));

        @SuppressWarnings("unchecked")
        Map<String, Object> alternativeScenarios = (Map<String, Object>) results.get("alternativeScenarios");
        assertEquals(3, alternativeScenarios.size());
        assertTrue(alternativeScenarios.containsKey("optimistic"));
        assertTrue(alternativeScenarios.containsKey("pessimistic"));
        assertTrue(alternativeScenarios.containsKey("earlyRetirement"));

        // Verify each scenario has comparison data
        @SuppressWarnings("unchecked")
        Map<String, Object> optimisticScenario = (Map<String, Object>) alternativeScenarios.get("optimistic");
        assertTrue(optimisticScenario.containsKey("comparisonToBase"));
    }

    @Test
    void testPerformMonteCarloSimulation() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(retirementPlanRepository.findLatestByUserId(testUser.getId())).thenReturn(Optional.of(testRetirementPlan));

        int numSimulations = 100; // Use smaller number for testing

        // Act
        Map<String, Object> results = scenarioAnalysisService.performMonteCarloSimulation("testuser", numSimulations);

        // Assert
        assertNotNull(results);
        assertEquals(numSimulations, results.get("numSimulations"));
        assertTrue(results.containsKey("successRate"));
        assertTrue(results.containsKey("balanceStatistics"));
        assertTrue(results.containsKey("incomeStatistics"));
        assertTrue(results.containsKey("percentiles"));
        assertTrue(results.containsKey("riskMetrics"));
        assertTrue(results.containsKey("recommendations"));

        // Verify success rate is a percentage
        Double successRate = (Double) results.get("successRate");
        assertTrue(successRate >= 0 && successRate <= 100);

        // Verify statistics structure
        @SuppressWarnings("unchecked")
        Map<String, BigDecimal> balanceStats = (Map<String, BigDecimal>) results.get("balanceStatistics");
        assertTrue(balanceStats.containsKey("mean"));
        assertTrue(balanceStats.containsKey("min"));
        assertTrue(balanceStats.containsKey("max"));
        assertTrue(balanceStats.containsKey("standardDeviation"));

        // Verify percentiles
        @SuppressWarnings("unchecked")
        Map<String, BigDecimal> percentiles = (Map<String, BigDecimal>) results.get("percentiles");
        assertTrue(percentiles.containsKey("p5"));
        assertTrue(percentiles.containsKey("p50"));
        assertTrue(percentiles.containsKey("p95"));

        // Verify risk metrics
        @SuppressWarnings("unchecked")
        Map<String, Object> riskMetrics = (Map<String, Object>) results.get("riskMetrics");
        assertTrue(riskMetrics.containsKey("valueAtRisk5"));
        assertTrue(riskMetrics.containsKey("shortfallProbability"));
        assertTrue(riskMetrics.containsKey("averageShortfall"));

        // Verify recommendations
        @SuppressWarnings("unchecked")
        List<String> recommendations = (List<String>) results.get("recommendations");
        assertNotNull(recommendations);
        assertTrue(recommendations.size() > 0);
    }

    @Test
    void testPerformSensitivityAnalysis() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(retirementPlanRepository.findLatestByUserId(testUser.getId())).thenReturn(Optional.of(testRetirementPlan));

        // Act
        Map<String, Object> results = scenarioAnalysisService.performSensitivityAnalysis("testuser");

        // Assert
        assertNotNull(results);
        assertTrue(results.containsKey("baseScenario"));
        assertTrue(results.containsKey("sensitivityAnalysis"));
        assertTrue(results.containsKey("mostSensitiveVariable"));

        @SuppressWarnings("unchecked")
        Map<String, Object> baseScenario = (Map<String, Object>) results.get("baseScenario");
        assertNotNull(baseScenario.get("finalBalance"));

        @SuppressWarnings("unchecked")
        Map<String, Map<String, Object>> sensitivityAnalysis = 
                (Map<String, Map<String, Object>>) results.get("sensitivityAnalysis");
        
        assertTrue(sensitivityAnalysis.containsKey("returnRate"));
        assertTrue(sensitivityAnalysis.containsKey("contributionRate"));
        assertTrue(sensitivityAnalysis.containsKey("inflationRate"));

        // Verify each variable has scenarios and sensitivity measure
        Map<String, Object> returnRateAnalysis = sensitivityAnalysis.get("returnRate");
        assertTrue(returnRateAnalysis.containsKey("scenarios"));
        assertTrue(returnRateAnalysis.containsKey("sensitivity"));

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> scenarios = (List<Map<String, Object>>) returnRateAnalysis.get("scenarios");
        assertTrue(scenarios.size() > 0);
        
        Map<String, Object> firstScenario = scenarios.get(0);
        assertTrue(firstScenario.containsKey("value"));
        assertTrue(firstScenario.containsKey("finalBalance"));
        assertTrue(firstScenario.containsKey("percentChange"));

        // Verify most sensitive variable is identified
        String mostSensitive = (String) results.get("mostSensitiveVariable");
        assertNotNull(mostSensitive);
        assertTrue(sensitivityAnalysis.containsKey(mostSensitive));
    }

    @Test
    void testCreateGoalPrioritizationMatrix() {
        // Arrange
        List<Map<String, Object>> goals = Arrays.asList(
                Map.of(
                        "name", "Emergency Fund",
                        "category", "emergency_fund",
                        "amount", 15000,
                        "timelineMonths", 12,
                        "monthlyCapacity", 1500
                ),
                Map.of(
                        "name", "House Down Payment",
                        "category", "home_purchase",
                        "amount", 80000,
                        "timelineMonths", 36,
                        "monthlyCapacity", 2000
                ),
                Map.of(
                        "name", "Vacation",
                        "category", "vacation",
                        "amount", 5000,
                        "timelineMonths", 18,
                        "monthlyCapacity", 300
                )
        );

        // Act
        Map<String, Object> results = scenarioAnalysisService.createGoalPrioritizationMatrix("testuser", goals);

        // Assert
        assertNotNull(results);
        assertTrue(results.containsKey("prioritizedGoals"));
        assertTrue(results.containsKey("recommendations"));
        assertTrue(results.containsKey("tradeOffAnalysis"));

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> prioritizedGoals = (List<Map<String, Object>>) results.get("prioritizedGoals");
        assertEquals(3, prioritizedGoals.size());

        // Verify goals are scored and prioritized
        Map<String, Object> topGoal = prioritizedGoals.get(0);
        assertTrue(topGoal.containsKey("urgencyScore"));
        assertTrue(topGoal.containsKey("impactScore"));
        assertTrue(topGoal.containsKey("feasibilityScore"));
        assertTrue(topGoal.containsKey("costScore"));
        assertTrue(topGoal.containsKey("totalScore"));
        assertTrue(topGoal.containsKey("priority"));

        // Emergency fund should typically be highest priority
        assertEquals("Emergency Fund", topGoal.get("name"));
        assertEquals("HIGH", topGoal.get("priority"));

        // Verify scores are within expected range
        Integer urgencyScore = (Integer) topGoal.get("urgencyScore");
        Integer impactScore = (Integer) topGoal.get("impactScore");
        Integer feasibilityScore = (Integer) topGoal.get("feasibilityScore");
        Integer costScore = (Integer) topGoal.get("costScore");

        assertTrue(urgencyScore >= 0 && urgencyScore <= 100);
        assertTrue(impactScore >= 0 && impactScore <= 100);
        assertTrue(feasibilityScore >= 0 && feasibilityScore <= 100);
        assertTrue(costScore >= 0 && costScore <= 100);

        // Verify recommendations
        @SuppressWarnings("unchecked")
        List<String> recommendations = (List<String>) results.get("recommendations");
        assertNotNull(recommendations);
        assertTrue(recommendations.size() > 0);

        // Verify trade-off analysis
        @SuppressWarnings("unchecked")
        Map<String, Object> tradeOffAnalysis = (Map<String, Object>) results.get("tradeOffAnalysis");
        assertTrue(tradeOffAnalysis.containsKey("totalFundingNeeded"));
        assertTrue(tradeOffAnalysis.containsKey("totalMonthlyCapacity"));
        assertTrue(tradeOffAnalysis.containsKey("potentialConflicts"));
    }

    @Test
    void testWhatIfAnalysisWithUserNotFound() {
        // Arrange
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        Map<String, Object> scenarios = Map.of("test", Map.of("returnRate", 0.08));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            scenarioAnalysisService.performWhatIfAnalysis("nonexistent", scenarios);
        });

        assertEquals("User not found", exception.getMessage());
    }

    @Test
    void testWhatIfAnalysisWithNoRetirementPlan() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(retirementPlanRepository.findLatestByUserId(testUser.getId())).thenReturn(Optional.empty());

        Map<String, Object> scenarios = Map.of("test", Map.of("returnRate", 0.08));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            scenarioAnalysisService.performWhatIfAnalysis("testuser", scenarios);
        });

        assertEquals("No retirement plan found", exception.getMessage());
    }

    @Test
    void testMonteCarloSimulationVariability() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(retirementPlanRepository.findLatestByUserId(testUser.getId())).thenReturn(Optional.of(testRetirementPlan));

        // Act
        Map<String, Object> results = scenarioAnalysisService.performMonteCarloSimulation("testuser", 50);

        // Assert
        @SuppressWarnings("unchecked")
        Map<String, BigDecimal> balanceStats = (Map<String, BigDecimal>) results.get("balanceStatistics");
        
        BigDecimal min = balanceStats.get("min");
        BigDecimal max = balanceStats.get("max");
        BigDecimal stdDev = balanceStats.get("standardDeviation");

        // Verify there's variability in the results
        assertTrue(max.compareTo(min) > 0);
        assertTrue(stdDev.compareTo(BigDecimal.ZERO) > 0);
    }

    @Test
    void testGoalPrioritizationScoring() {
        // Arrange - Test different goal categories and their scoring
        List<Map<String, Object>> goals = Arrays.asList(
                Map.of(
                        "name", "Emergency Fund",
                        "category", "emergency_fund",
                        "amount", 10000,
                        "timelineMonths", 6,
                        "monthlyCapacity", 2000
                ),
                Map.of(
                        "name", "Vacation",
                        "category", "vacation",
                        "amount", 5000,
                        "timelineMonths", 12,
                        "monthlyCapacity", 400
                ),
                Map.of(
                        "name", "Debt Payoff",
                        "category", "debt_payoff",
                        "amount", 20000,
                        "timelineMonths", 24,
                        "monthlyCapacity", 1000
                )
        );

        // Act
        Map<String, Object> results = scenarioAnalysisService.createGoalPrioritizationMatrix("testuser", goals);

        // Assert
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> prioritizedGoals = (List<Map<String, Object>>) results.get("prioritizedGoals");

        // Emergency fund should be highest priority
        Map<String, Object> topGoal = prioritizedGoals.get(0);
        assertEquals("Emergency Fund", topGoal.get("name"));

        // Vacation should be lowest priority
        Map<String, Object> bottomGoal = prioritizedGoals.get(prioritizedGoals.size() - 1);
        assertEquals("Vacation", bottomGoal.get("name"));

        // Verify debt payoff has high impact score
        Optional<Map<String, Object>> debtGoal = prioritizedGoals.stream()
                .filter(goal -> "Debt Payoff".equals(goal.get("name")))
                .findFirst();
        assertTrue(debtGoal.isPresent());
        Integer impactScore = (Integer) debtGoal.get().get("impactScore");
        assertTrue(impactScore >= 80); // Debt payoff should have high impact
    }

    @Test
    void testSensitivityAnalysisIdentifiesMostSensitiveVariable() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(retirementPlanRepository.findLatestByUserId(testUser.getId())).thenReturn(Optional.of(testRetirementPlan));

        // Act
        Map<String, Object> results = scenarioAnalysisService.performSensitivityAnalysis("testuser");

        // Assert
        String mostSensitive = (String) results.get("mostSensitiveVariable");
        assertNotNull(mostSensitive);
        
        // Should be one of the analyzed variables
        assertTrue(Arrays.asList("returnRate", "contributionRate", "inflationRate").contains(mostSensitive));

        @SuppressWarnings("unchecked")
        Map<String, Map<String, Object>> sensitivityAnalysis = 
                (Map<String, Map<String, Object>>) results.get("sensitivityAnalysis");
        
        // The most sensitive variable should have the highest sensitivity value
        BigDecimal maxSensitivity = BigDecimal.ZERO;
        for (Map<String, Object> analysis : sensitivityAnalysis.values()) {
            BigDecimal sensitivity = (BigDecimal) analysis.get("sensitivity");
            if (sensitivity.compareTo(maxSensitivity) > 0) {
                maxSensitivity = sensitivity;
            }
        }

        BigDecimal mostSensitiveValue = (BigDecimal) sensitivityAnalysis.get(mostSensitive).get("sensitivity");
        assertEquals(maxSensitivity, mostSensitiveValue);
    }
}