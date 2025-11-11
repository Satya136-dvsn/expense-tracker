package com.budgettracker.service;

import com.budgettracker.model.RetirementPlan;
import com.budgettracker.model.User;
import com.budgettracker.repository.RetirementPlanRepository;
import com.budgettracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.IntStream;

@Service
public class ScenarioAnalysisService {
    
    @Autowired
    private RetirementPlanRepository retirementPlanRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    private static final int SCALE = 2;
    private static final RoundingMode ROUNDING_MODE = RoundingMode.HALF_UP;
    private static final Random random = new Random();
    
    /**
     * Perform what-if analysis for retirement planning
     */
    public Map<String, Object> performWhatIfAnalysis(String username, Map<String, Object> scenarios) {
        User user = getUserByUsername(username);
        RetirementPlan basePlan = retirementPlanRepository.findLatestByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("No retirement plan found"));
        
        Map<String, Object> results = new HashMap<>();
        
        // Base scenario
        Map<String, Object> baseScenario = calculateRetirementScenario(basePlan);
        results.put("baseScenario", baseScenario);
        
        // Alternative scenarios
        Map<String, Object> alternativeScenarios = new HashMap<>();
        
        for (Map.Entry<String, Object> scenario : scenarios.entrySet()) {
            String scenarioName = scenario.getKey();
            Map<String, Object> scenarioParams = (Map<String, Object>) scenario.getValue();
            
            RetirementPlan modifiedPlan = createModifiedPlan(basePlan, scenarioParams);
            Map<String, Object> scenarioResult = calculateRetirementScenario(modifiedPlan);
            
            // Add comparison metrics
            scenarioResult.put("comparisonToBase", compareScenarios(baseScenario, scenarioResult));
            
            alternativeScenarios.put(scenarioName, scenarioResult);
        }
        
        results.put("alternativeScenarios", alternativeScenarios);
        results.put("summary", generateScenarioSummary(baseScenario, alternativeScenarios));
        
        return results;
    }
    
    /**
     * Perform Monte Carlo simulation for retirement planning
     */
    public Map<String, Object> performMonteCarloSimulation(String username, int numSimulations) {
        User user = getUserByUsername(username);
        RetirementPlan basePlan = retirementPlanRepository.findLatestByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("No retirement plan found"));
        
        List<BigDecimal> finalBalances = new ArrayList<>();
        List<BigDecimal> monthlyIncomes = new ArrayList<>();
        List<Boolean> successfulRetirements = new ArrayList<>();
        
        BigDecimal targetMonthlyIncome = basePlan.getCurrentAnnualIncome()
                .multiply(basePlan.getDesiredReplacementRatio())
                .divide(new BigDecimal("12"), SCALE, ROUNDING_MODE);
        
        // Run simulations
        for (int i = 0; i < numSimulations; i++) {
            Map<String, Object> simulation = runSingleSimulation(basePlan);
            
            BigDecimal finalBalance = (BigDecimal) simulation.get("finalBalance");
            BigDecimal monthlyIncome = (BigDecimal) simulation.get("monthlyIncome");
            boolean isSuccessful = monthlyIncome.compareTo(targetMonthlyIncome) >= 0;
            
            finalBalances.add(finalBalance);
            monthlyIncomes.add(monthlyIncome);
            successfulRetirements.add(isSuccessful);
        }
        
        // Calculate statistics
        Map<String, Object> results = new HashMap<>();
        results.put("numSimulations", numSimulations);
        results.put("successRate", calculateSuccessRate(successfulRetirements));
        results.put("balanceStatistics", calculateStatistics(finalBalances));
        results.put("incomeStatistics", calculateStatistics(monthlyIncomes));
        results.put("percentiles", calculatePercentiles(finalBalances));
        results.put("riskMetrics", calculateRiskMetrics(finalBalances, monthlyIncomes, targetMonthlyIncome));
        results.put("recommendations", generateMonteCarloRecommendations(results));
        
        return results;
    }
    
    /**
     * Perform sensitivity analysis
     */
    public Map<String, Object> performSensitivityAnalysis(String username) {
        User user = getUserByUsername(username);
        RetirementPlan basePlan = retirementPlanRepository.findLatestByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("No retirement plan found"));
        
        Map<String, Object> results = new HashMap<>();
        Map<String, Object> baseScenario = calculateRetirementScenario(basePlan);
        BigDecimal baseBalance = (BigDecimal) baseScenario.get("finalBalance");
        
        // Variables to analyze
        Map<String, List<BigDecimal>> variableRanges = new HashMap<>();
        variableRanges.put("returnRate", Arrays.asList(
                new BigDecimal("0.04"), new BigDecimal("0.06"), new BigDecimal("0.08"), new BigDecimal("0.10")
        ));
        variableRanges.put("contributionRate", Arrays.asList(
                new BigDecimal("0.05"), new BigDecimal("0.10"), new BigDecimal("0.15"), new BigDecimal("0.20")
        ));
        variableRanges.put("inflationRate", Arrays.asList(
                new BigDecimal("0.02"), new BigDecimal("0.025"), new BigDecimal("0.03"), new BigDecimal("0.035")
        ));
        
        Map<String, Map<String, Object>> sensitivityResults = new HashMap<>();
        
        for (Map.Entry<String, List<BigDecimal>> variable : variableRanges.entrySet()) {
            String variableName = variable.getKey();
            List<BigDecimal> values = variable.getValue();
            
            Map<String, Object> variableResults = new HashMap<>();
            List<Map<String, Object>> scenarios = new ArrayList<>();
            
            for (BigDecimal value : values) {
                Map<String, Object> scenarioParams = new HashMap<>();
                scenarioParams.put(variableName, value);
                
                RetirementPlan modifiedPlan = createModifiedPlan(basePlan, scenarioParams);
                Map<String, Object> scenarioResult = calculateRetirementScenario(modifiedPlan);
                
                BigDecimal scenarioBalance = (BigDecimal) scenarioResult.get("finalBalance");
                BigDecimal percentChange = scenarioBalance.subtract(baseBalance)
                        .divide(baseBalance, 4, ROUNDING_MODE)
                        .multiply(new BigDecimal("100"));
                
                Map<String, Object> scenario = new HashMap<>();
                scenario.put("value", value);
                scenario.put("finalBalance", scenarioBalance);
                scenario.put("percentChange", percentChange);
                
                scenarios.add(scenario);
            }
            
            variableResults.put("scenarios", scenarios);
            variableResults.put("sensitivity", calculateVariableSensitivity(scenarios));
            
            sensitivityResults.put(variableName, variableResults);
        }
        
        results.put("baseScenario", baseScenario);
        results.put("sensitivityAnalysis", sensitivityResults);
        results.put("mostSensitiveVariable", findMostSensitiveVariable(sensitivityResults));
        
        return results;
    }
    
    /**
     * Create goal prioritization matrix
     */
    public Map<String, Object> createGoalPrioritizationMatrix(String username, List<Map<String, Object>> goals) {
        Map<String, Object> results = new HashMap<>();
        
        // Score each goal based on multiple criteria
        List<Map<String, Object>> scoredGoals = new ArrayList<>();
        
        for (Map<String, Object> goal : goals) {
            Map<String, Object> scoredGoal = new HashMap<>(goal);
            
            // Calculate scores (0-100 scale)
            int urgencyScore = calculateUrgencyScore(goal);
            int impactScore = calculateImpactScore(goal);
            int feasibilityScore = calculateFeasibilityScore(goal);
            int costScore = calculateCostScore(goal);
            
            // Weighted total score
            double totalScore = (urgencyScore * 0.3) + (impactScore * 0.3) + 
                               (feasibilityScore * 0.25) + (costScore * 0.15);
            
            scoredGoal.put("urgencyScore", urgencyScore);
            scoredGoal.put("impactScore", impactScore);
            scoredGoal.put("feasibilityScore", feasibilityScore);
            scoredGoal.put("costScore", costScore);
            scoredGoal.put("totalScore", totalScore);
            scoredGoal.put("priority", getPriorityLevel(totalScore));
            
            scoredGoals.add(scoredGoal);
        }
        
        // Sort by total score (highest first)
        scoredGoals.sort((a, b) -> Double.compare(
                (Double) b.get("totalScore"), 
                (Double) a.get("totalScore")
        ));
        
        results.put("prioritizedGoals", scoredGoals);
        results.put("recommendations", generatePrioritizationRecommendations(scoredGoals));
        results.put("tradeOffAnalysis", analyzeTradeOffs(scoredGoals));
        
        return results;
    }
    
    // Private helper methods
    
    private User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    private Map<String, Object> calculateRetirementScenario(RetirementPlan plan) {
        Map<String, Object> result = new HashMap<>();
        
        int yearsToRetirement = plan.getRetirementAge() - plan.getCurrentAge();
        BigDecimal monthlyReturn = plan.getExpectedAnnualReturn().divide(new BigDecimal("12"), 6, ROUNDING_MODE);
        
        // Calculate future value of current balances
        BigDecimal current401kFV = calculateFutureValue(
                plan.getCurrent401kBalance(), monthlyReturn, yearsToRetirement * 12);
        BigDecimal currentIraFV = calculateFutureValue(
                plan.getCurrentIraBalance(), monthlyReturn, yearsToRetirement * 12);
        BigDecimal otherSavingsFV = calculateFutureValue(
                plan.getOtherRetirementSavings(), monthlyReturn, yearsToRetirement * 12);
        
        // Calculate future value of contributions
        BigDecimal monthly401kContribution = plan.getMonthly401kContribution();
        BigDecimal monthlyIraContribution = plan.getMonthlyIraContribution();
        
        // Add employer match
        BigDecimal employerMatch = monthly401kContribution
                .multiply(plan.getEmployerMatchRate())
                .min(plan.getCurrentAnnualIncome().divide(new BigDecimal("12"), SCALE, ROUNDING_MODE)
                        .multiply(plan.getEmployerMatchLimit()));
        
        BigDecimal total401kContribution = monthly401kContribution.add(employerMatch);
        
        BigDecimal contributions401kFV = calculateFutureValueOfAnnuity(
                total401kContribution, monthlyReturn, yearsToRetirement * 12);
        BigDecimal contributionsIraFV = calculateFutureValueOfAnnuity(
                monthlyIraContribution, monthlyReturn, yearsToRetirement * 12);
        
        BigDecimal totalBalance = current401kFV.add(currentIraFV).add(otherSavingsFV)
                .add(contributions401kFV).add(contributionsIraFV);
        
        // Calculate monthly retirement income (4% rule)
        BigDecimal monthlyIncome = totalBalance.multiply(new BigDecimal("0.04"))
                .divide(new BigDecimal("12"), SCALE, ROUNDING_MODE);
        
        // Add Social Security
        if (plan.getSocialSecurityBenefit() != null) {
            monthlyIncome = monthlyIncome.add(plan.getSocialSecurityBenefit());
        }
        
        result.put("finalBalance", totalBalance);
        result.put("monthlyIncome", monthlyIncome);
        result.put("total401kBalance", current401kFV.add(contributions401kFV));
        result.put("totalIraBalance", currentIraFV.add(contributionsIraFV));
        result.put("totalOtherSavings", otherSavingsFV);
        
        return result;
    }
    
    private RetirementPlan createModifiedPlan(RetirementPlan basePlan, Map<String, Object> modifications) {
        RetirementPlan modifiedPlan = new RetirementPlan();
        
        // Copy base plan values
        modifiedPlan.setUser(basePlan.getUser());
        modifiedPlan.setCurrentAge(basePlan.getCurrentAge());
        modifiedPlan.setRetirementAge(basePlan.getRetirementAge());
        modifiedPlan.setCurrentAnnualIncome(basePlan.getCurrentAnnualIncome());
        modifiedPlan.setDesiredReplacementRatio(basePlan.getDesiredReplacementRatio());
        modifiedPlan.setCurrent401kBalance(basePlan.getCurrent401kBalance());
        modifiedPlan.setCurrentIraBalance(basePlan.getCurrentIraBalance());
        modifiedPlan.setOtherRetirementSavings(basePlan.getOtherRetirementSavings());
        modifiedPlan.setMonthly401kContribution(basePlan.getMonthly401kContribution());
        modifiedPlan.setMonthlyIraContribution(basePlan.getMonthlyIraContribution());
        modifiedPlan.setEmployerMatchRate(basePlan.getEmployerMatchRate());
        modifiedPlan.setEmployerMatchLimit(basePlan.getEmployerMatchLimit());
        modifiedPlan.setExpectedAnnualReturn(basePlan.getExpectedAnnualReturn());
        modifiedPlan.setExpectedInflationRate(basePlan.getExpectedInflationRate());
        modifiedPlan.setSocialSecurityBenefit(basePlan.getSocialSecurityBenefit());
        modifiedPlan.setLifeExpectancy(basePlan.getLifeExpectancy());
        
        // Apply modifications
        for (Map.Entry<String, Object> modification : modifications.entrySet()) {
            String field = modification.getKey();
            Object value = modification.getValue();
            
            switch (field) {
                case "returnRate":
                    modifiedPlan.setExpectedAnnualReturn(new BigDecimal(value.toString()));
                    break;
                case "contributionRate":
                    BigDecimal contributionRate = new BigDecimal(value.toString());
                    BigDecimal monthlyIncome = basePlan.getCurrentAnnualIncome().divide(new BigDecimal("12"), SCALE, ROUNDING_MODE);
                    BigDecimal newContribution = monthlyIncome.multiply(contributionRate);
                    modifiedPlan.setMonthly401kContribution(newContribution);
                    break;
                case "inflationRate":
                    modifiedPlan.setExpectedInflationRate(new BigDecimal(value.toString()));
                    break;
                case "retirementAge":
                    modifiedPlan.setRetirementAge((Integer) value);
                    break;
                case "monthly401kContribution":
                    modifiedPlan.setMonthly401kContribution(new BigDecimal(value.toString()));
                    break;
                case "monthlyIraContribution":
                    modifiedPlan.setMonthlyIraContribution(new BigDecimal(value.toString()));
                    break;
            }
        }
        
        return modifiedPlan;
    }
    
    private Map<String, Object> compareScenarios(Map<String, Object> base, Map<String, Object> scenario) {
        Map<String, Object> comparison = new HashMap<>();
        
        BigDecimal baseBalance = (BigDecimal) base.get("finalBalance");
        BigDecimal scenarioBalance = (BigDecimal) scenario.get("finalBalance");
        BigDecimal balanceDifference = scenarioBalance.subtract(baseBalance);
        BigDecimal balancePercentChange = balanceDifference.divide(baseBalance, 4, ROUNDING_MODE)
                .multiply(new BigDecimal("100"));
        
        BigDecimal baseIncome = (BigDecimal) base.get("monthlyIncome");
        BigDecimal scenarioIncome = (BigDecimal) scenario.get("monthlyIncome");
        BigDecimal incomeDifference = scenarioIncome.subtract(baseIncome);
        BigDecimal incomePercentChange = incomeDifference.divide(baseIncome, 4, ROUNDING_MODE)
                .multiply(new BigDecimal("100"));
        
        comparison.put("balanceDifference", balanceDifference);
        comparison.put("balancePercentChange", balancePercentChange);
        comparison.put("incomeDifference", incomeDifference);
        comparison.put("incomePercentChange", incomePercentChange);
        
        return comparison;
    }
    
    private Map<String, Object> runSingleSimulation(RetirementPlan plan) {
        // Add randomness to key variables
        BigDecimal baseReturn = plan.getExpectedAnnualReturn();
        BigDecimal volatility = new BigDecimal("0.15"); // 15% volatility
        
        // Generate random annual returns using normal distribution approximation
        List<BigDecimal> annualReturns = new ArrayList<>();
        int yearsToRetirement = plan.getRetirementAge() - plan.getCurrentAge();
        
        for (int year = 0; year < yearsToRetirement; year++) {
            double randomReturn = generateNormalRandom(baseReturn.doubleValue(), volatility.doubleValue());
            annualReturns.add(new BigDecimal(randomReturn).setScale(4, ROUNDING_MODE));
        }
        
        // Calculate final balance with variable returns
        BigDecimal totalBalance = simulateVariableReturns(plan, annualReturns);
        
        // Calculate monthly income (4% rule)
        BigDecimal monthlyIncome = totalBalance.multiply(new BigDecimal("0.04"))
                .divide(new BigDecimal("12"), SCALE, ROUNDING_MODE);
        
        // Add Social Security
        if (plan.getSocialSecurityBenefit() != null) {
            monthlyIncome = monthlyIncome.add(plan.getSocialSecurityBenefit());
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("finalBalance", totalBalance);
        result.put("monthlyIncome", monthlyIncome);
        result.put("annualReturns", annualReturns);
        
        return result;
    }
    
    private BigDecimal simulateVariableReturns(RetirementPlan plan, List<BigDecimal> annualReturns) {
        BigDecimal balance401k = plan.getCurrent401kBalance();
        BigDecimal balanceIra = plan.getCurrentIraBalance();
        BigDecimal balanceOther = plan.getOtherRetirementSavings();
        
        BigDecimal monthly401kContribution = plan.getMonthly401kContribution();
        BigDecimal monthlyIraContribution = plan.getMonthlyIraContribution();
        
        // Add employer match
        BigDecimal employerMatch = monthly401kContribution
                .multiply(plan.getEmployerMatchRate())
                .min(plan.getCurrentAnnualIncome().divide(new BigDecimal("12"), SCALE, ROUNDING_MODE)
                        .multiply(plan.getEmployerMatchLimit()));
        
        BigDecimal total401kContribution = monthly401kContribution.add(employerMatch);
        
        for (BigDecimal annualReturn : annualReturns) {
            BigDecimal monthlyReturn = annualReturn.divide(new BigDecimal("12"), 6, ROUNDING_MODE);
            
            // Apply monthly growth and contributions for 12 months
            for (int month = 0; month < 12; month++) {
                balance401k = balance401k.multiply(BigDecimal.ONE.add(monthlyReturn)).add(total401kContribution);
                balanceIra = balanceIra.multiply(BigDecimal.ONE.add(monthlyReturn)).add(monthlyIraContribution);
                balanceOther = balanceOther.multiply(BigDecimal.ONE.add(monthlyReturn));
            }
        }
        
        return balance401k.add(balanceIra).add(balanceOther);
    }
    
    private double generateNormalRandom(double mean, double stdDev) {
        // Box-Muller transformation for normal distribution
        double u1 = random.nextDouble();
        double u2 = random.nextDouble();
        double z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return mean + stdDev * z;
    }
    
    private BigDecimal calculateFutureValue(BigDecimal presentValue, BigDecimal monthlyRate, int months) {
        if (monthlyRate.compareTo(BigDecimal.ZERO) == 0) {
            return presentValue;
        }
        
        BigDecimal factor = BigDecimal.ONE.add(monthlyRate).pow(months);
        return presentValue.multiply(factor).setScale(SCALE, ROUNDING_MODE);
    }
    
    private BigDecimal calculateFutureValueOfAnnuity(BigDecimal payment, BigDecimal monthlyRate, int months) {
        if (monthlyRate.compareTo(BigDecimal.ZERO) == 0) {
            return payment.multiply(new BigDecimal(months));
        }
        
        BigDecimal factor = BigDecimal.ONE.add(monthlyRate).pow(months).subtract(BigDecimal.ONE);
        return payment.multiply(factor).divide(monthlyRate, SCALE, ROUNDING_MODE);
    }
    
    private double calculateSuccessRate(List<Boolean> successes) {
        long successCount = successes.stream().mapToLong(success -> success ? 1 : 0).sum();
        return (double) successCount / successes.size() * 100;
    }
    
    private Map<String, BigDecimal> calculateStatistics(List<BigDecimal> values) {
        Map<String, BigDecimal> stats = new HashMap<>();
        
        BigDecimal sum = values.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal mean = sum.divide(new BigDecimal(values.size()), SCALE, ROUNDING_MODE);
        
        BigDecimal min = values.stream().min(BigDecimal::compareTo).orElse(BigDecimal.ZERO);
        BigDecimal max = values.stream().max(BigDecimal::compareTo).orElse(BigDecimal.ZERO);
        
        // Calculate standard deviation
        BigDecimal variance = values.stream()
                .map(value -> value.subtract(mean).pow(2))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(new BigDecimal(values.size()), SCALE, ROUNDING_MODE);
        
        BigDecimal stdDev = new BigDecimal(Math.sqrt(variance.doubleValue())).setScale(SCALE, ROUNDING_MODE);
        
        stats.put("mean", mean);
        stats.put("min", min);
        stats.put("max", max);
        stats.put("standardDeviation", stdDev);
        
        return stats;
    }
    
    private Map<String, BigDecimal> calculatePercentiles(List<BigDecimal> values) {
        List<BigDecimal> sortedValues = new ArrayList<>(values);
        sortedValues.sort(BigDecimal::compareTo);
        
        Map<String, BigDecimal> percentiles = new HashMap<>();
        
        int[] percentilePoints = {5, 10, 25, 50, 75, 90, 95};
        
        for (int percentile : percentilePoints) {
            int index = (int) Math.ceil(percentile / 100.0 * sortedValues.size()) - 1;
            index = Math.max(0, Math.min(index, sortedValues.size() - 1));
            percentiles.put("p" + percentile, sortedValues.get(index));
        }
        
        return percentiles;
    }
    
    private Map<String, Object> calculateRiskMetrics(List<BigDecimal> balances, List<BigDecimal> incomes, BigDecimal targetIncome) {
        Map<String, Object> metrics = new HashMap<>();
        
        // Value at Risk (VaR) - 5th percentile
        List<BigDecimal> sortedBalances = new ArrayList<>(balances);
        sortedBalances.sort(BigDecimal::compareTo);
        int varIndex = (int) Math.ceil(0.05 * sortedBalances.size()) - 1;
        BigDecimal var5 = sortedBalances.get(Math.max(0, varIndex));
        
        // Shortfall probability
        long shortfallCount = incomes.stream()
                .mapToLong(income -> income.compareTo(targetIncome) < 0 ? 1 : 0)
                .sum();
        double shortfallProbability = (double) shortfallCount / incomes.size() * 100;
        
        // Average shortfall amount
        BigDecimal totalShortfall = incomes.stream()
                .filter(income -> income.compareTo(targetIncome) < 0)
                .map(income -> targetIncome.subtract(income))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal avgShortfall = shortfallCount > 0 ? 
                totalShortfall.divide(new BigDecimal(shortfallCount), SCALE, ROUNDING_MODE) : 
                BigDecimal.ZERO;
        
        metrics.put("valueAtRisk5", var5);
        metrics.put("shortfallProbability", shortfallProbability);
        metrics.put("averageShortfall", avgShortfall);
        
        return metrics;
    }
    
    private List<String> generateMonteCarloRecommendations(Map<String, Object> results) {
        List<String> recommendations = new ArrayList<>();
        
        double successRate = (Double) results.get("successRate");
        Map<String, Object> riskMetrics = (Map<String, Object>) results.get("riskMetrics");
        double shortfallProbability = (Double) riskMetrics.get("shortfallProbability");
        
        if (successRate < 70) {
            recommendations.add("Consider increasing your retirement contributions to improve success rate");
        }
        
        if (shortfallProbability > 30) {
            recommendations.add("High shortfall risk detected - consider more conservative planning assumptions");
        }
        
        if (successRate > 90) {
            recommendations.add("Excellent retirement readiness - consider optimizing for tax efficiency");
        }
        
        recommendations.add("Review and adjust your plan annually based on market conditions and life changes");
        
        return recommendations;
    }
    
    private Map<String, Object> generateScenarioSummary(Map<String, Object> base, Map<String, Object> alternatives) {
        Map<String, Object> summary = new HashMap<>();
        
        BigDecimal baseBalance = (BigDecimal) base.get("finalBalance");
        
        // Find best and worst scenarios
        String bestScenario = null;
        String worstScenario = null;
        BigDecimal bestBalance = baseBalance;
        BigDecimal worstBalance = baseBalance;
        
        for (Map.Entry<String, Object> entry : alternatives.entrySet()) {
            String scenarioName = entry.getKey();
            Map<String, Object> scenario = (Map<String, Object>) entry.getValue();
            BigDecimal scenarioBalance = (BigDecimal) scenario.get("finalBalance");
            
            if (scenarioBalance.compareTo(bestBalance) > 0) {
                bestScenario = scenarioName;
                bestBalance = scenarioBalance;
            }
            
            if (scenarioBalance.compareTo(worstBalance) < 0) {
                worstScenario = scenarioName;
                worstBalance = scenarioBalance;
            }
        }
        
        summary.put("bestScenario", bestScenario);
        summary.put("worstScenario", worstScenario);
        summary.put("bestBalance", bestBalance);
        summary.put("worstBalance", worstBalance);
        summary.put("balanceRange", bestBalance.subtract(worstBalance));
        
        return summary;
    }
    
    private BigDecimal calculateVariableSensitivity(List<Map<String, Object>> scenarios) {
        if (scenarios.size() < 2) return BigDecimal.ZERO;
        
        List<BigDecimal> percentChanges = scenarios.stream()
                .map(scenario -> (BigDecimal) scenario.get("percentChange"))
                .sorted()
                .toList();
        
        return percentChanges.get(percentChanges.size() - 1).subtract(percentChanges.get(0));
    }
    
    private String findMostSensitiveVariable(Map<String, Map<String, Object>> sensitivityResults) {
        String mostSensitive = null;
        BigDecimal maxSensitivity = BigDecimal.ZERO;
        
        for (Map.Entry<String, Map<String, Object>> entry : sensitivityResults.entrySet()) {
            String variable = entry.getKey();
            Map<String, Object> results = entry.getValue();
            BigDecimal sensitivity = (BigDecimal) results.get("sensitivity");
            
            if (sensitivity.compareTo(maxSensitivity) > 0) {
                maxSensitivity = sensitivity;
                mostSensitive = variable;
            }
        }
        
        return mostSensitive;
    }
    
    // Goal prioritization helper methods
    
    private int calculateUrgencyScore(Map<String, Object> goal) {
        // Score based on timeline and deadline pressure
        Integer timelineMonths = (Integer) goal.getOrDefault("timelineMonths", 60);
        
        if (timelineMonths <= 12) return 100;
        if (timelineMonths <= 24) return 80;
        if (timelineMonths <= 36) return 60;
        if (timelineMonths <= 60) return 40;
        return 20;
    }
    
    private int calculateImpactScore(Map<String, Object> goal) {
        // Score based on financial impact and life importance
        String category = (String) goal.getOrDefault("category", "other");
        BigDecimal amount = new BigDecimal(goal.getOrDefault("amount", "0").toString());
        
        int categoryScore = switch (category.toLowerCase()) {
            case "emergency_fund" -> 100;
            case "retirement" -> 90;
            case "debt_payoff" -> 85;
            case "home_purchase" -> 75;
            case "education" -> 70;
            case "vacation" -> 30;
            default -> 50;
        };
        
        // Adjust based on amount
        if (amount.compareTo(new BigDecimal("100000")) > 0) categoryScore += 10;
        else if (amount.compareTo(new BigDecimal("10000")) < 0) categoryScore -= 10;
        
        return Math.max(0, Math.min(100, categoryScore));
    }
    
    private int calculateFeasibilityScore(Map<String, Object> goal) {
        // Score based on how achievable the goal is
        BigDecimal amount = new BigDecimal(goal.getOrDefault("amount", "0").toString());
        BigDecimal monthlyCapacity = new BigDecimal(goal.getOrDefault("monthlyCapacity", "0").toString());
        Integer timelineMonths = (Integer) goal.getOrDefault("timelineMonths", 60);
        
        if (monthlyCapacity.compareTo(BigDecimal.ZERO) <= 0) return 0;
        
        BigDecimal requiredMonthly = amount.divide(new BigDecimal(timelineMonths), SCALE, ROUNDING_MODE);
        BigDecimal feasibilityRatio = monthlyCapacity.divide(requiredMonthly, 4, ROUNDING_MODE);
        
        if (feasibilityRatio.compareTo(new BigDecimal("1.5")) >= 0) return 100;
        if (feasibilityRatio.compareTo(new BigDecimal("1.2")) >= 0) return 80;
        if (feasibilityRatio.compareTo(new BigDecimal("1.0")) >= 0) return 60;
        if (feasibilityRatio.compareTo(new BigDecimal("0.8")) >= 0) return 40;
        return 20;
    }
    
    private int calculateCostScore(Map<String, Object> goal) {
        // Score based on opportunity cost (inverse of amount)
        BigDecimal amount = new BigDecimal(goal.getOrDefault("amount", "0").toString());
        
        if (amount.compareTo(new BigDecimal("5000")) <= 0) return 100;
        if (amount.compareTo(new BigDecimal("25000")) <= 0) return 80;
        if (amount.compareTo(new BigDecimal("100000")) <= 0) return 60;
        if (amount.compareTo(new BigDecimal("500000")) <= 0) return 40;
        return 20;
    }
    
    private String getPriorityLevel(double totalScore) {
        if (totalScore >= 80) return "HIGH";
        if (totalScore >= 60) return "MEDIUM";
        if (totalScore >= 40) return "LOW";
        return "VERY_LOW";
    }
    
    private List<String> generatePrioritizationRecommendations(List<Map<String, Object>> goals) {
        List<String> recommendations = new ArrayList<>();
        
        long highPriorityCount = goals.stream()
                .mapToLong(goal -> "HIGH".equals(goal.get("priority")) ? 1 : 0)
                .sum();
        
        if (highPriorityCount > 3) {
            recommendations.add("You have many high-priority goals. Consider focusing on the top 2-3 to avoid spreading resources too thin.");
        }
        
        recommendations.add("Start with emergency fund if not already established - it enables all other goals.");
        recommendations.add("Consider automating savings for your top priority goals to ensure consistent progress.");
        recommendations.add("Review and adjust goal priorities quarterly as circumstances change.");
        
        return recommendations;
    }
    
    private Map<String, Object> analyzeTradeOffs(List<Map<String, Object>> goals) {
        Map<String, Object> analysis = new HashMap<>();
        
        // Calculate total funding needed vs. available
        BigDecimal totalNeeded = goals.stream()
                .map(goal -> new BigDecimal(goal.getOrDefault("amount", "0").toString()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalCapacity = goals.stream()
                .map(goal -> new BigDecimal(goal.getOrDefault("monthlyCapacity", "0").toString()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        analysis.put("totalFundingNeeded", totalNeeded);
        analysis.put("totalMonthlyCapacity", totalCapacity);
        
        // Identify potential conflicts
        List<String> conflicts = new ArrayList<>();
        
        if (goals.size() > 5) {
            conflicts.add("Too many simultaneous goals may reduce focus and effectiveness");
        }
        
        long emergencyFundGoals = goals.stream()
                .mapToLong(goal -> "emergency_fund".equals(goal.get("category")) ? 1 : 0)
                .sum();
        
        if (emergencyFundGoals == 0) {
            conflicts.add("No emergency fund goal detected - this should be prioritized first");
        }
        
        analysis.put("potentialConflicts", conflicts);
        
        return analysis;
    }
}