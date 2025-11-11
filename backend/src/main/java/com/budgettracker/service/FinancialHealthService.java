package com.budgettracker.service;

import com.budgettracker.model.Investment;
import com.budgettracker.model.Investment.InvestmentType;
import com.budgettracker.model.SavingsGoal;
import com.budgettracker.model.Transaction;
import com.budgettracker.model.User;
import com.budgettracker.repository.InvestmentRepository;
import com.budgettracker.repository.SavingsGoalRepository;
import com.budgettracker.repository.TransactionRepository;
import com.budgettracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FinancialHealthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private TransactionRepository transactionRepository;
    
    @Autowired
    private SavingsGoalRepository savingsGoalRepository;
    
    @Autowired
    private InvestmentRepository investmentRepository;
    
    public Map<String, Object> calculateFinancialHealthScore(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        Map<String, Object> healthScore = new HashMap<>();
        
        // Calculate individual components
        int budgetScore = calculateBudgetScore(user.getId());
        int savingsScore = calculateSavingsScore(user.getId());
        int investmentScore = calculateInvestmentScore(user.getId());
        int diversificationScore = calculateDiversificationScore(user.getId());
        int netWorthScore = calculateNetWorthScore(user.getId());
        
        // Calculate overall score (weighted average)
        int overallScore = (int) Math.round(
            budgetScore * 0.25 +
            savingsScore * 0.20 +
            investmentScore * 0.25 +
            diversificationScore * 0.15 +
            netWorthScore * 0.15
        );
        
        healthScore.put("overallScore", overallScore);
        healthScore.put("budgetScore", budgetScore);
        healthScore.put("savingsScore", savingsScore);
        healthScore.put("investmentScore", investmentScore);
        healthScore.put("diversificationScore", diversificationScore);
        healthScore.put("netWorthScore", netWorthScore);
        
        // Add detailed metrics
        healthScore.put("netWorth", calculateNetWorth(user.getId()));
        healthScore.put("investmentAllocation", getInvestmentAllocation(user.getId()));
        healthScore.put("recommendations", generateRecommendations(user.getId()));
        healthScore.put("scoreLevel", getScoreLevel(overallScore));
        
        return healthScore;
    }
    
    private int calculateBudgetScore(Long userId) {
        // Get recent transactions (last 3 months)
        LocalDateTime threeMonthsAgo = LocalDateTime.now().minusMonths(3);
        List<Transaction> recentTransactions = transactionRepository
                .findByUserIdAndTransactionDateAfter(userId, threeMonthsAgo);
        
        if (recentTransactions.isEmpty()) {
            return 50; // Neutral score if no data
        }
        
        // Calculate income vs expenses ratio
        BigDecimal totalIncome = recentTransactions.stream()
                .filter(t -> t.getType() == Transaction.TransactionType.INCOME)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalExpenses = recentTransactions.stream()
                .filter(t -> t.getType() == Transaction.TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        if (totalIncome.compareTo(BigDecimal.ZERO) == 0) {
            return 30; // Low score if no income
        }
        
        BigDecimal expenseRatio = totalExpenses.divide(totalIncome, 4, RoundingMode.HALF_UP);
        
        // Score based on expense ratio
        if (expenseRatio.compareTo(new BigDecimal("0.5")) <= 0) return 100; // Excellent
        if (expenseRatio.compareTo(new BigDecimal("0.7")) <= 0) return 80;  // Good
        if (expenseRatio.compareTo(new BigDecimal("0.9")) <= 0) return 60;  // Fair
        if (expenseRatio.compareTo(new BigDecimal("1.0")) <= 0) return 40;  // Poor
        return 20; // Very poor (spending more than earning)
    }
    
    private int calculateSavingsScore(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return 0;
        
        List<SavingsGoal> goals = savingsGoalRepository.findByUserOrderByCreatedAtDesc(user);
        
        if (goals.isEmpty()) {
            return 30; // Low score if no savings goals
        }
        
        // Calculate average progress across all goals
        double averageProgress = goals.stream()
                .mapToDouble(goal -> {
                    if (goal.getTargetAmount().compareTo(BigDecimal.ZERO) == 0) return 0;
                    return goal.getCurrentAmount().divide(goal.getTargetAmount(), 4, RoundingMode.HALF_UP)
                            .multiply(new BigDecimal("100")).doubleValue();
                })
                .average()
                .orElse(0.0);
        
        // Bonus for having multiple goals
        int goalBonus = Math.min(goals.size() * 5, 20);
        
        return Math.min(100, (int) averageProgress + goalBonus);
    }
    
    private int calculateInvestmentScore(Long userId) {
        List<Investment> investments = investmentRepository.findByUserIdOrderByPurchaseDateDesc(userId);
        
        if (investments.isEmpty()) {
            return 20; // Low score if no investments
        }
        
        BigDecimal totalValue = investmentRepository.calculateTotalPortfolioValue(userId);
        BigDecimal totalCost = investmentRepository.calculateTotalCostBasis(userId);
        
        // Base score for having investments
        int baseScore = 40;
        
        // Performance bonus/penalty
        int performanceScore = 0;
        if (totalCost.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal returnPercentage = totalValue.subtract(totalCost)
                    .divide(totalCost, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"));
            
            if (returnPercentage.compareTo(new BigDecimal("20")) >= 0) performanceScore = 30;
            else if (returnPercentage.compareTo(new BigDecimal("10")) >= 0) performanceScore = 20;
            else if (returnPercentage.compareTo(new BigDecimal("5")) >= 0) performanceScore = 10;
            else if (returnPercentage.compareTo(BigDecimal.ZERO) >= 0) performanceScore = 5;
            else performanceScore = -10; // Penalty for losses
        }
        
        // Portfolio size bonus
        int sizeBonus = 0;
        if (totalValue.compareTo(new BigDecimal("100000")) >= 0) sizeBonus = 20;
        else if (totalValue.compareTo(new BigDecimal("50000")) >= 0) sizeBonus = 15;
        else if (totalValue.compareTo(new BigDecimal("10000")) >= 0) sizeBonus = 10;
        else if (totalValue.compareTo(new BigDecimal("1000")) >= 0) sizeBonus = 5;
        
        return Math.min(100, Math.max(0, baseScore + performanceScore + sizeBonus));
    }
    
    private int calculateDiversificationScore(Long userId) {
        List<Investment> investments = investmentRepository.findByUserIdOrderByPurchaseDateDesc(userId);
        
        if (investments.isEmpty()) {
            return 0;
        }
        
        // Count unique asset types
        Set<InvestmentType> uniqueTypes = investments.stream()
                .map(Investment::getType)
                .collect(Collectors.toSet());
        
        // Count unique symbols
        Set<String> uniqueSymbols = investments.stream()
                .map(Investment::getSymbol)
                .collect(Collectors.toSet());
        
        // Calculate allocation balance
        Map<InvestmentType, BigDecimal> allocation = new HashMap<>();
        BigDecimal totalValue = BigDecimal.ZERO;
        
        for (Investment investment : investments) {
            BigDecimal value = investment.getCurrentValue();
            totalValue = totalValue.add(value);
            allocation.merge(investment.getType(), value, BigDecimal::add);
        }
        
        // Calculate concentration risk (Herfindahl index)
        double concentrationRisk = 0.0;
        if (totalValue.compareTo(BigDecimal.ZERO) > 0) {
            for (BigDecimal value : allocation.values()) {
                double percentage = value.divide(totalValue, 4, RoundingMode.HALF_UP).doubleValue();
                concentrationRisk += percentage * percentage;
            }
        }
        
        // Score based on diversification factors
        int typeScore = Math.min(40, uniqueTypes.size() * 10);
        int symbolScore = Math.min(30, uniqueSymbols.size() * 3);
        int concentrationScore = (int) ((1.0 - concentrationRisk) * 30);
        
        return Math.min(100, typeScore + symbolScore + concentrationScore);
    }
    
    private int calculateNetWorthScore(Long userId) {
        BigDecimal netWorth = calculateNetWorth(userId);
        
        // Score based on net worth ranges
        if (netWorth.compareTo(new BigDecimal("1000000")) >= 0) return 100;
        if (netWorth.compareTo(new BigDecimal("500000")) >= 0) return 90;
        if (netWorth.compareTo(new BigDecimal("250000")) >= 0) return 80;
        if (netWorth.compareTo(new BigDecimal("100000")) >= 0) return 70;
        if (netWorth.compareTo(new BigDecimal("50000")) >= 0) return 60;
        if (netWorth.compareTo(new BigDecimal("25000")) >= 0) return 50;
        if (netWorth.compareTo(new BigDecimal("10000")) >= 0) return 40;
        if (netWorth.compareTo(new BigDecimal("5000")) >= 0) return 30;
        if (netWorth.compareTo(BigDecimal.ZERO) >= 0) return 20;
        return 10; // Negative net worth
    }
    
    private BigDecimal calculateNetWorth(Long userId) {
        // Get current savings from user profile
        User user = userRepository.findById(userId).orElse(null);
        BigDecimal currentSavings = user != null ? (user.getCurrentSavings() != null ? user.getCurrentSavings() : BigDecimal.ZERO) : BigDecimal.ZERO;
        
        // Add investment portfolio value
        BigDecimal investmentValue = investmentRepository.calculateTotalPortfolioValue(userId);
        
        // Add savings goals current amounts
        User userForSavings = userRepository.findById(userId).orElse(null);
        BigDecimal savingsGoalsValue = BigDecimal.ZERO;
        if (userForSavings != null) {
            savingsGoalsValue = savingsGoalRepository.findByUserOrderByCreatedAtDesc(userForSavings)
                    .stream()
                    .map(SavingsGoal::getCurrentAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }
        
        return currentSavings.add(investmentValue).add(savingsGoalsValue);
    }
    
    private Map<String, Object> getInvestmentAllocation(Long userId) {
        List<Object[]> allocationData = investmentRepository.getPortfolioAllocationByType(userId);
        
        Map<String, Object> allocation = new HashMap<>();
        BigDecimal totalValue = BigDecimal.ZERO;
        
        for (Object[] data : allocationData) {
            InvestmentType type = (InvestmentType) data[0];
            BigDecimal value = (BigDecimal) data[1];
            totalValue = totalValue.add(value);
            allocation.put(type.name(), value);
        }
        
        allocation.put("totalValue", totalValue);
        return allocation;
    }
    
    private List<String> generateRecommendations(Long userId) {
        List<String> recommendations = new ArrayList<>();
        
        List<Investment> investments = investmentRepository.findByUserIdOrderByPurchaseDateDesc(userId);
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return recommendations;
        
        List<SavingsGoal> goals = savingsGoalRepository.findByUserOrderByCreatedAtDesc(user);
        
        // Investment recommendations
        if (investments.isEmpty()) {
            recommendations.add("Consider starting your investment journey with low-cost index funds or ETFs");
        } else {
            Set<InvestmentType> types = investments.stream().map(Investment::getType).collect(Collectors.toSet());
            
            if (types.size() < 3) {
                recommendations.add("Diversify your portfolio across different asset types (stocks, bonds, REITs)");
            }
            
            if (!types.contains(InvestmentType.BOND)) {
                recommendations.add("Consider adding bonds to your portfolio for stability and income");
            }
            
            BigDecimal totalValue = investmentRepository.calculateTotalPortfolioValue(userId);
            if (totalValue.compareTo(new BigDecimal("10000")) < 0) {
                recommendations.add("Gradually increase your investment contributions to build wealth over time");
            }
        }
        
        // Savings recommendations
        if (goals.isEmpty()) {
            recommendations.add("Set specific savings goals to stay motivated and track progress");
        } else {
            long completedGoals = goals.stream()
                    .mapToLong(goal -> goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0 ? 1 : 0)
                    .sum();
            
            if (completedGoals == 0) {
                recommendations.add("Focus on completing at least one savings goal to build momentum");
            }
        }
        
        // Emergency fund recommendation
        BigDecimal netWorth = calculateNetWorth(userId);
        if (netWorth.compareTo(new BigDecimal("10000")) < 0) {
            recommendations.add("Build an emergency fund covering 3-6 months of expenses");
        }
        
        return recommendations;
    }
    
    private String getScoreLevel(int score) {
        if (score >= 90) return "Excellent";
        if (score >= 80) return "Very Good";
        if (score >= 70) return "Good";
        if (score >= 60) return "Fair";
        if (score >= 50) return "Poor";
        return "Very Poor";
    }
}