package com.budgettracker.dto;

import java.math.BigDecimal;
import java.util.List;

public class DebtOptimizationResponse {
    
    private String strategy;
    private BigDecimal totalDebt;
    private BigDecimal totalMinimumPayments;
    private BigDecimal extraPaymentAmount;
    private Integer payoffTimeMonths;
    private BigDecimal totalInterestPaid;
    private BigDecimal interestSavings;
    private List<DebtPayoffPlan> payoffPlan;
    private DebtOptimizationComparison comparison;
    
    // Constructors
    public DebtOptimizationResponse() {}
    
    public DebtOptimizationResponse(String strategy, BigDecimal totalDebt, BigDecimal totalMinimumPayments,
                                    BigDecimal extraPaymentAmount, Integer payoffTimeMonths,
                                    BigDecimal totalInterestPaid, List<DebtPayoffPlan> payoffPlan) {
        this.strategy = strategy;
        this.totalDebt = totalDebt;
        this.totalMinimumPayments = totalMinimumPayments;
        this.extraPaymentAmount = extraPaymentAmount;
        this.payoffTimeMonths = payoffTimeMonths;
        this.totalInterestPaid = totalInterestPaid;
        this.payoffPlan = payoffPlan;
    }
    
    // Getters and Setters
    public String getStrategy() {
        return strategy;
    }
    
    public void setStrategy(String strategy) {
        this.strategy = strategy;
    }
    
    public BigDecimal getTotalDebt() {
        return totalDebt;
    }
    
    public void setTotalDebt(BigDecimal totalDebt) {
        this.totalDebt = totalDebt;
    }
    
    public BigDecimal getTotalMinimumPayments() {
        return totalMinimumPayments;
    }
    
    public void setTotalMinimumPayments(BigDecimal totalMinimumPayments) {
        this.totalMinimumPayments = totalMinimumPayments;
    }
    
    public BigDecimal getExtraPaymentAmount() {
        return extraPaymentAmount;
    }
    
    public void setExtraPaymentAmount(BigDecimal extraPaymentAmount) {
        this.extraPaymentAmount = extraPaymentAmount;
    }
    
    public Integer getPayoffTimeMonths() {
        return payoffTimeMonths;
    }
    
    public void setPayoffTimeMonths(Integer payoffTimeMonths) {
        this.payoffTimeMonths = payoffTimeMonths;
    }
    
    public BigDecimal getTotalInterestPaid() {
        return totalInterestPaid;
    }
    
    public void setTotalInterestPaid(BigDecimal totalInterestPaid) {
        this.totalInterestPaid = totalInterestPaid;
    }
    
    public BigDecimal getInterestSavings() {
        return interestSavings;
    }
    
    public void setInterestSavings(BigDecimal interestSavings) {
        this.interestSavings = interestSavings;
    }
    
    public List<DebtPayoffPlan> getPayoffPlan() {
        return payoffPlan;
    }
    
    public void setPayoffPlan(List<DebtPayoffPlan> payoffPlan) {
        this.payoffPlan = payoffPlan;
    }
    
    public DebtOptimizationComparison getComparison() {
        return comparison;
    }
    
    public void setComparison(DebtOptimizationComparison comparison) {
        this.comparison = comparison;
    }
    
    // Inner class for individual debt payoff plan
    public static class DebtPayoffPlan {
        private Long debtId;
        private String debtName;
        private BigDecimal currentBalance;
        private BigDecimal interestRate;
        private BigDecimal minimumPayment;
        private BigDecimal recommendedPayment;
        private Integer payoffOrder;
        private Integer monthsToPayoff;
        private BigDecimal totalInterest;
        
        // Constructors
        public DebtPayoffPlan() {}
        
        public DebtPayoffPlan(Long debtId, String debtName, BigDecimal currentBalance,
                              BigDecimal interestRate, BigDecimal minimumPayment,
                              BigDecimal recommendedPayment, Integer payoffOrder,
                              Integer monthsToPayoff, BigDecimal totalInterest) {
            this.debtId = debtId;
            this.debtName = debtName;
            this.currentBalance = currentBalance;
            this.interestRate = interestRate;
            this.minimumPayment = minimumPayment;
            this.recommendedPayment = recommendedPayment;
            this.payoffOrder = payoffOrder;
            this.monthsToPayoff = monthsToPayoff;
            this.totalInterest = totalInterest;
        }
        
        // Getters and Setters
        public Long getDebtId() {
            return debtId;
        }
        
        public void setDebtId(Long debtId) {
            this.debtId = debtId;
        }
        
        public String getDebtName() {
            return debtName;
        }
        
        public void setDebtName(String debtName) {
            this.debtName = debtName;
        }
        
        public BigDecimal getCurrentBalance() {
            return currentBalance;
        }
        
        public void setCurrentBalance(BigDecimal currentBalance) {
            this.currentBalance = currentBalance;
        }
        
        public BigDecimal getInterestRate() {
            return interestRate;
        }
        
        public void setInterestRate(BigDecimal interestRate) {
            this.interestRate = interestRate;
        }
        
        public BigDecimal getMinimumPayment() {
            return minimumPayment;
        }
        
        public void setMinimumPayment(BigDecimal minimumPayment) {
            this.minimumPayment = minimumPayment;
        }
        
        public BigDecimal getRecommendedPayment() {
            return recommendedPayment;
        }
        
        public void setRecommendedPayment(BigDecimal recommendedPayment) {
            this.recommendedPayment = recommendedPayment;
        }
        
        public Integer getPayoffOrder() {
            return payoffOrder;
        }
        
        public void setPayoffOrder(Integer payoffOrder) {
            this.payoffOrder = payoffOrder;
        }
        
        public Integer getMonthsToPayoff() {
            return monthsToPayoff;
        }
        
        public void setMonthsToPayoff(Integer monthsToPayoff) {
            this.monthsToPayoff = monthsToPayoff;
        }
        
        public BigDecimal getTotalInterest() {
            return totalInterest;
        }
        
        public void setTotalInterest(BigDecimal totalInterest) {
            this.totalInterest = totalInterest;
        }
    }
    
    // Inner class for strategy comparison
    public static class DebtOptimizationComparison {
        private DebtOptimizationResponse avalancheStrategy;
        private DebtOptimizationResponse snowballStrategy;
        private String recommendedStrategy;
        private String recommendationReason;
        
        // Constructors
        public DebtOptimizationComparison() {}
        
        public DebtOptimizationComparison(DebtOptimizationResponse avalancheStrategy,
                                          DebtOptimizationResponse snowballStrategy,
                                          String recommendedStrategy, String recommendationReason) {
            this.avalancheStrategy = avalancheStrategy;
            this.snowballStrategy = snowballStrategy;
            this.recommendedStrategy = recommendedStrategy;
            this.recommendationReason = recommendationReason;
        }
        
        // Getters and Setters
        public DebtOptimizationResponse getAvalancheStrategy() {
            return avalancheStrategy;
        }
        
        public void setAvalancheStrategy(DebtOptimizationResponse avalancheStrategy) {
            this.avalancheStrategy = avalancheStrategy;
        }
        
        public DebtOptimizationResponse getSnowballStrategy() {
            return snowballStrategy;
        }
        
        public void setSnowballStrategy(DebtOptimizationResponse snowballStrategy) {
            this.snowballStrategy = snowballStrategy;
        }
        
        public String getRecommendedStrategy() {
            return recommendedStrategy;
        }
        
        public void setRecommendedStrategy(String recommendedStrategy) {
            this.recommendedStrategy = recommendedStrategy;
        }
        
        public String getRecommendationReason() {
            return recommendationReason;
        }
        
        public void setRecommendationReason(String recommendationReason) {
            this.recommendationReason = recommendationReason;
        }
    }
}