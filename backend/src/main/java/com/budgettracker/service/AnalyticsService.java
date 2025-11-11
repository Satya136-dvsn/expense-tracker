package com.budgettracker.service;

import com.budgettracker.model.User;
import com.budgettracker.repository.UserRepository;
import com.budgettracker.repository.TransactionRepository;
import com.budgettracker.repository.BudgetRepository;
import com.budgettracker.repository.SavingsGoalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class AnalyticsService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private TransactionRepository transactionRepository;
    
    @Autowired
    private BudgetRepository budgetRepository;
    
    @Autowired
    private SavingsGoalRepository savingsGoalRepository;
    
    // Get monthly trends analysis with caching
    @Cacheable(value = "monthlyTrends", key = "#username + '_' + #months", unless = "#result == null")
    public Map<String, Object> getMonthlyTrends(int months, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusMonths(months);
        
        try {
            List<Object[]> monthlyData = transactionRepository.getMonthlyTrendData(user, startDate, endDate);
            
            List<Map<String, Object>> trends = monthlyData.stream()
                    .map(row -> {
                        Map<String, Object> monthData = new HashMap<>();
                        monthData.put("year", row[0]);
                        monthData.put("month", row[1]);
                        monthData.put("totalIncome", row[2] != null ? row[2] : BigDecimal.ZERO);
                        monthData.put("totalExpenses", row[3] != null ? row[3] : BigDecimal.ZERO);
                        
                        BigDecimal income = (BigDecimal) (row[2] != null ? row[2] : BigDecimal.ZERO);
                        BigDecimal expenses = (BigDecimal) (row[3] != null ? row[3] : BigDecimal.ZERO);
                        monthData.put("netSavings", income.subtract(expenses));
                        monthData.put("transactionCount", row[4] != null ? row[4] : 0L);
                        
                        return monthData;
                    })
                    .collect(Collectors.toList());
            
            // Calculate summary statistics
            BigDecimal avgIncome = trends.stream()
                    .map(m -> (BigDecimal) m.get("totalIncome"))
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .divide(BigDecimal.valueOf(Math.max(trends.size(), 1)), 2, RoundingMode.HALF_UP);
            
            BigDecimal avgExpenses = trends.stream()
                    .map(m -> (BigDecimal) m.get("totalExpenses"))
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .divide(BigDecimal.valueOf(Math.max(trends.size(), 1)), 2, RoundingMode.HALF_UP);
            
            Map<String, Object> result = new HashMap<>();
            result.put("trends", trends);
            result.put("averageIncome", avgIncome);
            result.put("averageExpenses", avgExpenses);
            result.put("trendDirection", calculateTrendDirection(trends));
            result.put("period", months + " months");
            
            return result;
        } catch (Exception e) {
            throw new RuntimeException("Failed to get monthly trends: " + e.getMessage(), e);
        }
    }
    
    // Get category breakdown analysis with caching
    @Cacheable(value = "categoryBreakdown", key = "#username + '_' + #startDate + '_' + #endDate", unless = "#result == null")
    public Map<String, Object> getCategoryBreakdown(String username, LocalDateTime startDate, LocalDateTime endDate) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        try {
            // Get expense breakdown
            List<Object[]> expenseBreakdown = transactionRepository.getExpenseBreakdownInPeriod(user, startDate, endDate);
            List<Map<String, Object>> expenseCategories = expenseBreakdown.stream()
                    .map(row -> {
                        Map<String, Object> category = new HashMap<>();
                        category.put("category", row[0]);
                        category.put("amount", row[1]);
                        category.put("transactionCount", row[2]);
                        return category;
                    })
                    .collect(Collectors.toList());
            
            // Get income breakdown
            List<Object[]> incomeBreakdown = transactionRepository.getIncomeBreakdownInPeriod(user, startDate, endDate);
            List<Map<String, Object>> incomeCategories = incomeBreakdown.stream()
                    .map(row -> {
                        Map<String, Object> category = new HashMap<>();
                        category.put("category", row[0]);
                        category.put("amount", row[1]);
                        category.put("transactionCount", row[2]);
                        return category;
                    })
                    .collect(Collectors.toList());
            
            // Calculate totals
            BigDecimal totalExpenses = expenseCategories.stream()
                    .map(c -> (BigDecimal) c.get("amount"))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            BigDecimal totalIncome = incomeCategories.stream()
                    .map(c -> (BigDecimal) c.get("amount"))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // Find top spending category
            String topSpendingCategory = expenseCategories.stream()
                    .max(Comparator.comparing(c -> (BigDecimal) c.get("amount")))
                    .map(c -> (String) c.get("category"))
                    .orElse("No expenses");
            
            Map<String, Object> result = new HashMap<>();
            result.put("expenseCategories", expenseCategories);
            result.put("incomeCategories", incomeCategories);
            result.put("totalExpenses", totalExpenses);
            result.put("totalIncome", totalIncome);
            result.put("topSpendingCategory", topSpendingCategory);
            result.put("categoryCount", expenseCategories.size() + incomeCategories.size());
            
            return result;
        } catch (Exception e) {
            throw new RuntimeException("Failed to get category breakdown: " + e.getMessage(), e);
        }
    }
    
    // Get financial health score with caching
    @Cacheable(value = "financialHealth", key = "#username", unless = "#result == null")
    public Map<String, Object> calculateFinancialHealth(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        try {
            Map<String, Object> health = new HashMap<>();
            Map<String, Integer> factorScores = new HashMap<>();
            List<String> recommendations = new ArrayList<>();
            
            // Get recent financial data (last 3 months)
            LocalDateTime threeMonthsAgo = LocalDateTime.now().minusMonths(3);
            BigDecimal recentIncome = transactionRepository.calculateTotalIncomeInPeriod(user, threeMonthsAgo, LocalDateTime.now());
            BigDecimal recentExpenses = transactionRepository.calculateTotalExpensesInPeriod(user, threeMonthsAgo, LocalDateTime.now());
            
            if (recentIncome == null) recentIncome = BigDecimal.ZERO;
            if (recentExpenses == null) recentExpenses = BigDecimal.ZERO;
            
            // Calculate savings rate (40% of score)
            int savingsScore = calculateSavingsScore(recentIncome, recentExpenses);
            factorScores.put("savingsRate", savingsScore);
            
            // Calculate budget adherence (30% of score)
            int budgetScore = calculateBudgetAdherenceScore(user);
            factorScores.put("budgetAdherence", budgetScore);
            
            // Calculate goal progress (20% of score)
            int goalScore = calculateGoalProgressScore(user);
            factorScores.put("goalProgress", goalScore);
            
            // Calculate transaction consistency (10% of score)
            int consistencyScore = calculateTransactionConsistencyScore(user);
            factorScores.put("transactionConsistency", consistencyScore);
            
            // Calculate overall health score
            int overallScore = (int) Math.round(
                savingsScore * 0.4 + 
                budgetScore * 0.3 + 
                goalScore * 0.2 + 
                consistencyScore * 0.1
            );
            
            // Generate recommendations based on scores
            recommendations.addAll(generateHealthRecommendations(factorScores, recentIncome, recentExpenses));
            
            // Determine health trend
            String healthTrend = calculateHealthTrend(user);
            
            health.put("healthScore", overallScore);
            health.put("factorScores", factorScores);
            health.put("recommendations", recommendations);
            health.put("healthTrend", healthTrend);
            health.put("lastCalculated", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            
            return health;
        } catch (Exception e) {
            // Return basic health data if calculation fails
            Map<String, Object> basicHealth = new HashMap<>();
            basicHealth.put("healthScore", 50);
            basicHealth.put("factorScores", Map.of(
                "savingsRate", 50,
                "budgetAdherence", 50,
                "goalProgress", 50,
                "transactionConsistency", 50
            ));
            basicHealth.put("recommendations", List.of("Unable to calculate detailed health score. Please ensure you have sufficient transaction data."));
            basicHealth.put("healthTrend", "stable");
            basicHealth.put("error", e.getMessage());
            return basicHealth;
        }
    }
    
    // Get budget analysis with caching
    @Cacheable(value = "budgetAnalysis", key = "#username + '_' + #month + '_' + #year", unless = "#result == null")
    public Map<String, Object> getBudgetAnalysis(String username, int month, int year) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        try {
            LocalDateTime startDate = LocalDateTime.of(year, month, 1, 0, 0);
            LocalDateTime endDate = startDate.plusMonths(1).minusSeconds(1);
            
            // Get budget data for the period
            // Note: This assumes budgets are monthly. Adjust based on your budget model
            List<Object[]> budgetData = budgetRepository.getBudgetAnalysisData(user, month, year);
            
            List<Map<String, Object>> budgetComparisons = budgetData.stream()
                    .map(row -> {
                        Map<String, Object> comparison = new HashMap<>();
                        comparison.put("category", row[0]);
                        comparison.put("budgetedAmount", row[1] != null ? row[1] : BigDecimal.ZERO);
                        comparison.put("actualAmount", row[2] != null ? row[2] : BigDecimal.ZERO);
                        
                        BigDecimal budgeted = (BigDecimal) (row[1] != null ? row[1] : BigDecimal.ZERO);
                        BigDecimal actual = (BigDecimal) (row[2] != null ? row[2] : BigDecimal.ZERO);
                        
                        if (budgeted.compareTo(BigDecimal.ZERO) > 0) {
                            BigDecimal variance = actual.subtract(budgeted);
                            BigDecimal variancePercent = variance.divide(budgeted, 4, RoundingMode.HALF_UP)
                                    .multiply(new BigDecimal("100"));
                            comparison.put("variance", variance);
                            comparison.put("variancePercent", variancePercent);
                            comparison.put("isOverBudget", variance.compareTo(BigDecimal.ZERO) > 0);
                        } else {
                            comparison.put("variance", BigDecimal.ZERO);
                            comparison.put("variancePercent", BigDecimal.ZERO);
                            comparison.put("isOverBudget", false);
                        }
                        
                        return comparison;
                    })
                    .collect(Collectors.toList());
            
            // Calculate summary statistics
            BigDecimal totalBudgeted = budgetComparisons.stream()
                    .map(c -> (BigDecimal) c.get("budgetedAmount"))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            BigDecimal totalActual = budgetComparisons.stream()
                    .map(c -> (BigDecimal) c.get("actualAmount"))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            long overBudgetCount = budgetComparisons.stream()
                    .mapToLong(c -> (Boolean) c.get("isOverBudget") ? 1 : 0)
                    .sum();
            
            Map<String, Object> result = new HashMap<>();
            result.put("budgetComparisons", budgetComparisons);
            result.put("totalBudgeted", totalBudgeted);
            result.put("totalActual", totalActual);
            result.put("totalVariance", totalActual.subtract(totalBudgeted));
            result.put("overBudgetCategories", overBudgetCount);
            result.put("month", month);
            result.put("year", year);
            
            return result;
        } catch (Exception e) {
            throw new RuntimeException("Failed to get budget analysis: " + e.getMessage(), e);
        }
    }
    
    // Get savings progress analysis with caching
    @Cacheable(value = "savingsProgress", key = "#username", unless = "#result == null")
    public Map<String, Object> getSavingsProgress(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        try {
            List<Object[]> savingsData = savingsGoalRepository.getSavingsProgressData(user);
            
            List<Map<String, Object>> goalProgress = savingsData.stream()
                    .map(row -> {
                        Map<String, Object> progress = new HashMap<>();
                        progress.put("goalName", row[0]);
                        progress.put("targetAmount", row[1]);
                        progress.put("currentAmount", row[2]);
                        progress.put("targetDate", row[3]);
                        progress.put("status", row[4]);
                        
                        BigDecimal target = (BigDecimal) row[1];
                        BigDecimal current = (BigDecimal) row[2];
                        
                        if (target.compareTo(BigDecimal.ZERO) > 0) {
                            BigDecimal progressPercent = current.divide(target, 4, RoundingMode.HALF_UP)
                                    .multiply(new BigDecimal("100"));
                            progress.put("progressPercent", progressPercent);
                        } else {
                            progress.put("progressPercent", BigDecimal.ZERO);
                        }
                        
                        return progress;
                    })
                    .collect(Collectors.toList());
            
            // Calculate summary statistics
            BigDecimal totalTargetAmount = goalProgress.stream()
                    .map(g -> (BigDecimal) g.get("targetAmount"))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            BigDecimal totalCurrentAmount = goalProgress.stream()
                    .map(g -> (BigDecimal) g.get("currentAmount"))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            long completedGoals = goalProgress.stream()
                    .mapToLong(g -> "COMPLETED".equals(g.get("status")) ? 1 : 0)
                    .sum();
            
            Map<String, Object> result = new HashMap<>();
            result.put("goalProgress", goalProgress);
            result.put("totalTargetAmount", totalTargetAmount);
            result.put("totalCurrentAmount", totalCurrentAmount);
            result.put("overallProgressPercent", 
                totalTargetAmount.compareTo(BigDecimal.ZERO) > 0 ? 
                totalCurrentAmount.divide(totalTargetAmount, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100")) : 
                BigDecimal.ZERO);
            result.put("completedGoals", completedGoals);
            result.put("totalGoals", goalProgress.size());
            
            return result;
        } catch (Exception e) {
            throw new RuntimeException("Failed to get savings progress: " + e.getMessage(), e);
        }
    }
    
    // Get comprehensive spending pattern analysis
    public Map<String, Object> getSpendingPatternAnalysis(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        try {
            Map<String, Object> patterns = new HashMap<>();
            
            // Get spending velocity (transactions per week)
            LocalDateTime fourWeeksAgo = LocalDateTime.now().minusWeeks(4);
            long recentTransactionCount = transactionRepository.countByUserAndTransactionDateAfter(user, fourWeeksAgo);
            double transactionsPerWeek = recentTransactionCount / 4.0;
            
            // Get average transaction size by category
            List<Object[]> avgByCategory = transactionRepository.getAverageAmountByCategory(user);
            List<Map<String, Object>> categoryAverages = avgByCategory.stream()
                    .map(row -> {
                        Map<String, Object> avg = new HashMap<>();
                        avg.put("category", row[0]);
                        avg.put("averageAmount", row[1]);
                        avg.put("transactionCount", row[2]);
                        return avg;
                    })
                    .collect(Collectors.toList());
            
            // Get spending by day of week patterns
            List<Object[]> dayOfWeekData = transactionRepository.getSpendingByDayOfWeek(user);
            List<Map<String, Object>> dayOfWeekSpending = dayOfWeekData.stream()
                    .map(row -> {
                        Map<String, Object> dayData = new HashMap<>();
                        dayData.put("dayOfWeek", getDayName((Integer) row[0]));
                        dayData.put("totalAmount", row[1]);
                        dayData.put("transactionCount", row[2]);
                        return dayData;
                    })
                    .collect(Collectors.toList());
            
            // Calculate spending consistency score
            int consistencyScore = calculateSpendingConsistency(user);
            
            // Identify spending trends
            String spendingTrend = identifySpendingTrend(user);
            
            // Get top spending categories (top 5)
            List<Map<String, Object>> topCategories = categoryAverages.stream()
                    .sorted((a, b) -> ((BigDecimal) b.get("averageAmount")).compareTo((BigDecimal) a.get("averageAmount")))
                    .limit(5)
                    .collect(Collectors.toList());
            
            patterns.put("transactionsPerWeek", transactionsPerWeek);
            patterns.put("categoryAverages", categoryAverages);
            patterns.put("dayOfWeekSpending", dayOfWeekSpending);
            patterns.put("consistencyScore", consistencyScore);
            patterns.put("spendingTrend", spendingTrend);
            patterns.put("topSpendingCategories", topCategories);
            patterns.put("analysisDate", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            
            return patterns;
        } catch (Exception e) {
            throw new RuntimeException("Failed to analyze spending patterns: " + e.getMessage(), e);
        }
    }
    
    // Clear analytics cache when data changes
    @CacheEvict(value = {"monthlyTrends", "categoryBreakdown", "financialHealth", "budgetAnalysis", "savingsProgress"}, key = "#username")
    public void clearAnalyticsCache(String username) {
        // This method clears all analytics caches for a user when their data changes
    }

    // Enhanced financial health calculation with user profile data
    @Cacheable(value = "enhancedFinancialHealth", key = "#username", unless = "#result == null")
    public Map<String, Object> calculateEnhancedFinancialHealth(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        try {
            Map<String, Object> health = new HashMap<>();
            Map<String, Integer> factorScores = new HashMap<>();
            List<String> recommendations = new ArrayList<>();
            
            // Get recent financial data (last 3 months)
            LocalDateTime threeMonthsAgo = LocalDateTime.now().minusMonths(3);
            BigDecimal recentIncome = transactionRepository.calculateTotalIncomeInPeriod(user, threeMonthsAgo, LocalDateTime.now());
            BigDecimal recentExpenses = transactionRepository.calculateTotalExpensesInPeriod(user, threeMonthsAgo, LocalDateTime.now());
            
            if (recentIncome == null) recentIncome = BigDecimal.ZERO;
            if (recentExpenses == null) recentExpenses = BigDecimal.ZERO;
            
            // Use user profile data for enhanced scoring
            BigDecimal profileIncome = user.getMonthlyIncome() != null ? user.getMonthlyIncome().multiply(new BigDecimal("3")) : BigDecimal.ZERO;
            BigDecimal profileSavings = user.getCurrentSavings() != null ? user.getCurrentSavings() : BigDecimal.ZERO;
            BigDecimal profileTargetExpenses = user.getTargetExpenses() != null ? user.getTargetExpenses().multiply(new BigDecimal("3")) : BigDecimal.ZERO;
            
            // Calculate enhanced scores using both transaction and profile data
            int savingsScore = calculateEnhancedSavingsScore(recentIncome, recentExpenses, profileIncome, profileSavings);
            factorScores.put("savingsRate", savingsScore);
            
            int budgetScore = calculateBudgetAdherenceScore(user);
            factorScores.put("budgetAdherence", budgetScore);
            
            int goalScore = calculateGoalProgressScore(user);
            factorScores.put("goalProgress", goalScore);
            
            int consistencyScore = calculateTransactionConsistencyScore(user);
            factorScores.put("transactionConsistency", consistencyScore);
            
            // New: Income stability score
            int incomeStabilityScore = calculateIncomeStabilityScore(user);
            factorScores.put("incomeStability", incomeStabilityScore);
            
            // Calculate overall health score with enhanced weighting
            int overallScore = (int) Math.round(
                savingsScore * 0.35 + 
                budgetScore * 0.25 + 
                goalScore * 0.20 + 
                consistencyScore * 0.10 +
                incomeStabilityScore * 0.10
            );
            
            // Generate enhanced recommendations
            recommendations.addAll(generateEnhancedHealthRecommendations(factorScores, recentIncome, recentExpenses, user));
            
            // Determine health trend with more sophisticated analysis
            String healthTrend = calculateEnhancedHealthTrend(user);
            
            health.put("healthScore", overallScore);
            health.put("factorScores", factorScores);
            health.put("recommendations", recommendations);
            health.put("healthTrend", healthTrend);
            health.put("profileDataUsed", profileIncome.compareTo(BigDecimal.ZERO) > 0);
            health.put("lastCalculated", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            
            return health;
        } catch (Exception e) {
            // Return basic health data if calculation fails
            Map<String, Object> basicHealth = new HashMap<>();
            basicHealth.put("healthScore", 50);
            basicHealth.put("factorScores", Map.of(
                "savingsRate", 50,
                "budgetAdherence", 50,
                "goalProgress", 50,
                "transactionConsistency", 50,
                "incomeStability", 50
            ));
            basicHealth.put("recommendations", List.of("Unable to calculate detailed health score. Please ensure you have sufficient transaction data."));
            basicHealth.put("healthTrend", "stable");
            basicHealth.put("error", e.getMessage());
            return basicHealth;
        }
    }
    
    // Helper methods for enhanced analytics
    private String getDayName(int dayOfWeek) {
        String[] days = {"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"};
        return days[dayOfWeek - 1];
    }
    
    private int calculateSpendingConsistency(User user) {
        try {
            // Get last 4 weeks of spending
            LocalDateTime fourWeeksAgo = LocalDateTime.now().minusWeeks(4);
            List<BigDecimal> weeklySpending = new ArrayList<>();
            
            for (int i = 0; i < 4; i++) {
                LocalDateTime weekStart = fourWeeksAgo.plusWeeks(i);
                LocalDateTime weekEnd = weekStart.plusWeeks(1);
                BigDecimal weekSpending = transactionRepository.calculateTotalExpensesInPeriod(user, weekStart, weekEnd);
                weeklySpending.add(weekSpending != null ? weekSpending : BigDecimal.ZERO);
            }
            
            // Calculate coefficient of variation
            BigDecimal mean = weeklySpending.stream().reduce(BigDecimal.ZERO, BigDecimal::add)
                    .divide(new BigDecimal(weeklySpending.size()), 2, RoundingMode.HALF_UP);
            
            if (mean.compareTo(BigDecimal.ZERO) == 0) return 50;
            
            BigDecimal variance = weeklySpending.stream()
                    .map(spending -> spending.subtract(mean).pow(2))
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .divide(new BigDecimal(weeklySpending.size()), 2, RoundingMode.HALF_UP);
            
            double stdDev = Math.sqrt(variance.doubleValue());
            double coefficientOfVariation = stdDev / mean.doubleValue();
            
            // Lower variation = higher consistency score
            if (coefficientOfVariation < 0.2) return 100;
            if (coefficientOfVariation < 0.4) return 75;
            if (coefficientOfVariation < 0.6) return 50;
            return 25;
        } catch (Exception e) {
            return 50;
        }
    }
    
    private String identifySpendingTrend(User user) {
        try {
            LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6);
            LocalDateTime threeMonthsAgo = LocalDateTime.now().minusMonths(3);
            LocalDateTime now = LocalDateTime.now();
            
            BigDecimal oldPeriodSpending = transactionRepository.calculateTotalExpensesInPeriod(user, sixMonthsAgo, threeMonthsAgo);
            BigDecimal recentPeriodSpending = transactionRepository.calculateTotalExpensesInPeriod(user, threeMonthsAgo, now);
            
            if (oldPeriodSpending == null) oldPeriodSpending = BigDecimal.ZERO;
            if (recentPeriodSpending == null) recentPeriodSpending = BigDecimal.ZERO;
            
            if (oldPeriodSpending.compareTo(BigDecimal.ZERO) == 0) return "insufficient_data";
            
            BigDecimal changePercent = recentPeriodSpending.subtract(oldPeriodSpending)
                    .divide(oldPeriodSpending, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"));
            
            if (changePercent.compareTo(new BigDecimal("10")) > 0) return "increasing";
            if (changePercent.compareTo(new BigDecimal("-10")) < 0) return "decreasing";
            return "stable";
        } catch (Exception e) {
            return "stable";
        }
    }
    
    private int calculateEnhancedSavingsScore(BigDecimal transactionIncome, BigDecimal transactionExpenses, 
                                            BigDecimal profileIncome, BigDecimal profileSavings) {
        // Use profile data if available, otherwise fall back to transaction data
        BigDecimal income = profileIncome.compareTo(BigDecimal.ZERO) > 0 ? profileIncome : transactionIncome;
        BigDecimal expenses = transactionExpenses;
        
        if (income.compareTo(BigDecimal.ZERO) <= 0) return 0;
        
        BigDecimal savingsRate = income.subtract(expenses)
                .divide(income, 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"));
        
        // Enhanced scoring with profile savings consideration
        if (profileSavings.compareTo(income.multiply(new BigDecimal("6"))) > 0) {
            // Has 6+ months of income saved - bonus points
            savingsRate = savingsRate.add(new BigDecimal("10"));
        }
        
        if (savingsRate.compareTo(new BigDecimal("30")) >= 0) return 100;
        if (savingsRate.compareTo(new BigDecimal("20")) >= 0) return 85;
        if (savingsRate.compareTo(new BigDecimal("10")) >= 0) return 70;
        if (savingsRate.compareTo(new BigDecimal("5")) >= 0) return 50;
        if (savingsRate.compareTo(BigDecimal.ZERO) >= 0) return 25;
        return 0;
    }
    
    private int calculateIncomeStabilityScore(User user) {
        try {
            // Check income consistency over last 6 months
            LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6);
            List<BigDecimal> monthlyIncomes = new ArrayList<>();
            
            for (int i = 0; i < 6; i++) {
                LocalDateTime monthStart = sixMonthsAgo.plusMonths(i);
                LocalDateTime monthEnd = monthStart.plusMonths(1);
                BigDecimal monthIncome = transactionRepository.calculateTotalIncomeInPeriod(user, monthStart, monthEnd);
                monthlyIncomes.add(monthIncome != null ? monthIncome : BigDecimal.ZERO);
            }
            
            // Count months with income
            long monthsWithIncome = monthlyIncomes.stream()
                    .mapToLong(income -> income.compareTo(BigDecimal.ZERO) > 0 ? 1 : 0)
                    .sum();
            
            if (monthsWithIncome >= 6) return 100;
            if (monthsWithIncome >= 4) return 75;
            if (monthsWithIncome >= 2) return 50;
            if (monthsWithIncome >= 1) return 25;
            return 0;
        } catch (Exception e) {
            return 50;
        }
    }
    
    private List<String> generateEnhancedHealthRecommendations(Map<String, Integer> factorScores, 
                                                             BigDecimal income, BigDecimal expenses, User user) {
        List<String> recommendations = new ArrayList<>();
        
        int savingsScore = factorScores.get("savingsRate");
        int budgetScore = factorScores.get("budgetAdherence");
        int goalScore = factorScores.get("goalProgress");
        int incomeStabilityScore = factorScores.get("incomeStability");
        
        if (savingsScore < 50) {
            if (user.getCurrentSavings() == null || user.getCurrentSavings().compareTo(BigDecimal.ZERO) == 0) {
                recommendations.add("Start building an emergency fund. Aim to save at least $1,000 as a starter emergency fund.");
            } else {
                recommendations.add("Increase your savings rate. Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings.");
            }
        }
        
        if (budgetScore < 50) {
            recommendations.add("Create detailed budgets for each spending category and track your progress regularly.");
        }
        
        if (goalScore < 50) {
            recommendations.add("Set specific, measurable savings goals with target dates to improve your financial planning.");
        }
        
        if (incomeStabilityScore < 50) {
            recommendations.add("Consider diversifying your income sources or building skills for more stable employment.");
        }
        
        // Profile-specific recommendations
        if (user.getMonthlyIncome() != null && user.getCurrentSavings() != null) {
            BigDecimal monthsOfExpenses = user.getCurrentSavings().divide(
                expenses.divide(new BigDecimal("3"), 2, RoundingMode.HALF_UP), 2, RoundingMode.HALF_UP);
            
            if (monthsOfExpenses.compareTo(new BigDecimal("6")) < 0) {
                recommendations.add("Build your emergency fund to cover 6 months of expenses for better financial security.");
            }
        }
        
        if (recommendations.isEmpty()) {
            recommendations.add("Excellent financial health! Consider advanced strategies like investment diversification.");
        }
        
        return recommendations;
    }
    
    private String calculateEnhancedHealthTrend(User user) {
        try {
            // Compare current quarter vs previous quarter
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime threeMonthsAgo = now.minusMonths(3);
            LocalDateTime sixMonthsAgo = now.minusMonths(6);
            
            // Current quarter data
            BigDecimal currentIncome = transactionRepository.calculateTotalIncomeInPeriod(user, threeMonthsAgo, now);
            BigDecimal currentExpenses = transactionRepository.calculateTotalExpensesInPeriod(user, threeMonthsAgo, now);
            
            // Previous quarter data
            BigDecimal previousIncome = transactionRepository.calculateTotalIncomeInPeriod(user, sixMonthsAgo, threeMonthsAgo);
            BigDecimal previousExpenses = transactionRepository.calculateTotalExpensesInPeriod(user, sixMonthsAgo, threeMonthsAgo);
            
            if (currentIncome == null) currentIncome = BigDecimal.ZERO;
            if (currentExpenses == null) currentExpenses = BigDecimal.ZERO;
            if (previousIncome == null) previousIncome = BigDecimal.ZERO;
            if (previousExpenses == null) previousExpenses = BigDecimal.ZERO;
            
            BigDecimal currentSavings = currentIncome.subtract(currentExpenses);
            BigDecimal previousSavings = previousIncome.subtract(previousExpenses);
            
            if (previousSavings.compareTo(BigDecimal.ZERO) == 0) return "stable";
            
            BigDecimal savingsChange = currentSavings.subtract(previousSavings);
            BigDecimal changePercent = savingsChange.divide(previousSavings.abs(), 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"));
            
            if (changePercent.compareTo(new BigDecimal("15")) > 0) return "improving";
            if (changePercent.compareTo(new BigDecimal("-15")) < 0) return "declining";
            return "stable";
        } catch (Exception e) {
            return "stable";
        }
    }

    // Helper methods for financial health calculation
    private int calculateSavingsScore(BigDecimal income, BigDecimal expenses) {
        if (income.compareTo(BigDecimal.ZERO) <= 0) return 0;
        
        BigDecimal savingsRate = income.subtract(expenses)
                .divide(income, 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"));
        
        if (savingsRate.compareTo(new BigDecimal("20")) >= 0) return 100;
        if (savingsRate.compareTo(new BigDecimal("10")) >= 0) return 75;
        if (savingsRate.compareTo(new BigDecimal("5")) >= 0) return 50;
        if (savingsRate.compareTo(BigDecimal.ZERO) >= 0) return 25;
        return 0;
    }
    
    private int calculateBudgetAdherenceScore(User user) {
        // Simplified budget adherence calculation
        // In a real implementation, this would check actual vs budgeted amounts
        try {
            long totalBudgets = budgetRepository.countByUser(user);
            if (totalBudgets == 0) return 50; // Neutral score if no budgets
            
            // This is a placeholder - implement actual budget adherence logic
            return 75; // Assume good adherence for now
        } catch (Exception e) {
            return 50;
        }
    }
    
    private int calculateGoalProgressScore(User user) {
        try {
            long totalGoals = savingsGoalRepository.countByUser(user);
            if (totalGoals == 0) return 50; // Neutral score if no goals
            
            long completedGoals = savingsGoalRepository.countByUserAndStatus(user, "COMPLETED");
            if (totalGoals > 0) {
                return (int) ((completedGoals * 100) / totalGoals);
            }
            return 50;
        } catch (Exception e) {
            return 50;
        }
    }
    
    private int calculateTransactionConsistencyScore(User user) {
        try {
            // Check if user has transactions in recent months
            LocalDateTime threeMonthsAgo = LocalDateTime.now().minusMonths(3);
            long recentTransactions = transactionRepository.countByUserAndTransactionDateAfter(user, threeMonthsAgo);
            
            if (recentTransactions >= 10) return 100;
            if (recentTransactions >= 5) return 75;
            if (recentTransactions >= 1) return 50;
            return 25;
        } catch (Exception e) {
            return 50;
        }
    }
    
    private List<String> generateHealthRecommendations(Map<String, Integer> factorScores, BigDecimal income, BigDecimal expenses) {
        List<String> recommendations = new ArrayList<>();
        
        int savingsScore = factorScores.get("savingsRate");
        int budgetScore = factorScores.get("budgetAdherence");
        int goalScore = factorScores.get("goalProgress");
        
        if (savingsScore < 50) {
            recommendations.add("Consider increasing your savings rate. Aim to save at least 20% of your income.");
        }
        
        if (budgetScore < 50) {
            recommendations.add("Review your budget adherence. Consider setting more realistic budget limits.");
        }
        
        if (goalScore < 50) {
            recommendations.add("Set specific savings goals to improve your financial planning.");
        }
        
        if (income.compareTo(BigDecimal.ZERO) > 0 && expenses.divide(income, 4, RoundingMode.HALF_UP).compareTo(new BigDecimal("0.8")) > 0) {
            recommendations.add("Your expenses are high relative to income. Look for areas to reduce spending.");
        }
        
        if (recommendations.isEmpty()) {
            recommendations.add("Great job! Your financial health looks good. Keep up the good work!");
        }
        
        return recommendations;
    }
    
    private String calculateTrendDirection(List<Map<String, Object>> trends) {
        if (trends.size() < 2) return "stable";
        
        try {
            BigDecimal firstSavings = (BigDecimal) trends.get(0).get("netSavings");
            BigDecimal lastSavings = (BigDecimal) trends.get(trends.size() - 1).get("netSavings");
            
            BigDecimal difference = lastSavings.subtract(firstSavings);
            
            if (difference.compareTo(new BigDecimal("100")) > 0) return "improving";
            if (difference.compareTo(new BigDecimal("-100")) < 0) return "declining";
            return "stable";
        } catch (Exception e) {
            return "stable";
        }
    }
    
    private String calculateHealthTrend(User user) {
        // Simplified trend calculation
        // In a real implementation, this would compare current vs previous health scores
        return "stable";
    }
}