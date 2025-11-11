package com.budgettracker.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class TaxCalculationResponse {
    
    private Integer taxYear;
    private String filingStatus;
    private BigDecimal annualIncome;
    private BigDecimal adjustedGrossIncome;
    private BigDecimal taxableIncome;
    
    // Tax calculations
    private BigDecimal federalTaxOwed;
    private BigDecimal stateTaxOwed;
    private BigDecimal totalTaxOwed;
    
    // Withholding and payments
    private BigDecimal totalWithholding;
    private BigDecimal federalWithholding;
    private BigDecimal stateWithholding;
    private BigDecimal estimatedTaxPayments;
    
    // Refund or amount due
    private BigDecimal refundOrAmountDue;
    private Boolean isRefund;
    
    // Deductions
    private BigDecimal standardDeduction;
    private BigDecimal itemizedDeductions;
    private BigDecimal totalDeductions;
    private Boolean shouldItemize;
    
    // Tax brackets
    private List<TaxBracketInfo> federalTaxBrackets;
    private BigDecimal effectiveTaxRate;
    private BigDecimal marginalTaxRate;
    
    // Optimization suggestions
    private List<TaxOptimizationSuggestion> optimizationSuggestions;
    private BigDecimal potentialTaxSavings;
    
    // Tax-advantaged account analysis
    private TaxAdvantageAnalysis taxAdvantageAnalysis;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime calculatedAt;
    
    // Constructors
    public TaxCalculationResponse() {
        this.calculatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Integer getTaxYear() {
        return taxYear;
    }
    
    public void setTaxYear(Integer taxYear) {
        this.taxYear = taxYear;
    }
    
    public String getFilingStatus() {
        return filingStatus;
    }
    
    public void setFilingStatus(String filingStatus) {
        this.filingStatus = filingStatus;
    }
    
    public BigDecimal getAnnualIncome() {
        return annualIncome;
    }
    
    public void setAnnualIncome(BigDecimal annualIncome) {
        this.annualIncome = annualIncome;
    }
    
    public BigDecimal getAdjustedGrossIncome() {
        return adjustedGrossIncome;
    }
    
    public void setAdjustedGrossIncome(BigDecimal adjustedGrossIncome) {
        this.adjustedGrossIncome = adjustedGrossIncome;
    }
    
    public BigDecimal getTaxableIncome() {
        return taxableIncome;
    }
    
    public void setTaxableIncome(BigDecimal taxableIncome) {
        this.taxableIncome = taxableIncome;
    }
    
    public BigDecimal getFederalTaxOwed() {
        return federalTaxOwed;
    }
    
    public void setFederalTaxOwed(BigDecimal federalTaxOwed) {
        this.federalTaxOwed = federalTaxOwed;
    }
    
    public BigDecimal getStateTaxOwed() {
        return stateTaxOwed;
    }
    
    public void setStateTaxOwed(BigDecimal stateTaxOwed) {
        this.stateTaxOwed = stateTaxOwed;
    }
    
    public BigDecimal getTotalTaxOwed() {
        return totalTaxOwed;
    }
    
    public void setTotalTaxOwed(BigDecimal totalTaxOwed) {
        this.totalTaxOwed = totalTaxOwed;
    }
    
    public BigDecimal getTotalWithholding() {
        return totalWithholding;
    }
    
    public void setTotalWithholding(BigDecimal totalWithholding) {
        this.totalWithholding = totalWithholding;
    }
    
    public BigDecimal getFederalWithholding() {
        return federalWithholding;
    }
    
    public void setFederalWithholding(BigDecimal federalWithholding) {
        this.federalWithholding = federalWithholding;
    }
    
    public BigDecimal getStateWithholding() {
        return stateWithholding;
    }
    
    public void setStateWithholding(BigDecimal stateWithholding) {
        this.stateWithholding = stateWithholding;
    }
    
    public BigDecimal getEstimatedTaxPayments() {
        return estimatedTaxPayments;
    }
    
    public void setEstimatedTaxPayments(BigDecimal estimatedTaxPayments) {
        this.estimatedTaxPayments = estimatedTaxPayments;
    }
    
    public BigDecimal getRefundOrAmountDue() {
        return refundOrAmountDue;
    }
    
    public void setRefundOrAmountDue(BigDecimal refundOrAmountDue) {
        this.refundOrAmountDue = refundOrAmountDue;
    }
    
    public Boolean getIsRefund() {
        return isRefund;
    }
    
    public void setIsRefund(Boolean isRefund) {
        this.isRefund = isRefund;
    }
    
    public BigDecimal getStandardDeduction() {
        return standardDeduction;
    }
    
    public void setStandardDeduction(BigDecimal standardDeduction) {
        this.standardDeduction = standardDeduction;
    }
    
    public BigDecimal getItemizedDeductions() {
        return itemizedDeductions;
    }
    
    public void setItemizedDeductions(BigDecimal itemizedDeductions) {
        this.itemizedDeductions = itemizedDeductions;
    }
    
    public BigDecimal getTotalDeductions() {
        return totalDeductions;
    }
    
    public void setTotalDeductions(BigDecimal totalDeductions) {
        this.totalDeductions = totalDeductions;
    }
    
    public Boolean getShouldItemize() {
        return shouldItemize;
    }
    
    public void setShouldItemize(Boolean shouldItemize) {
        this.shouldItemize = shouldItemize;
    }
    
    public List<TaxBracketInfo> getFederalTaxBrackets() {
        return federalTaxBrackets;
    }
    
    public void setFederalTaxBrackets(List<TaxBracketInfo> federalTaxBrackets) {
        this.federalTaxBrackets = federalTaxBrackets;
    }
    
    public BigDecimal getEffectiveTaxRate() {
        return effectiveTaxRate;
    }
    
    public void setEffectiveTaxRate(BigDecimal effectiveTaxRate) {
        this.effectiveTaxRate = effectiveTaxRate;
    }
    
    public BigDecimal getMarginalTaxRate() {
        return marginalTaxRate;
    }
    
    public void setMarginalTaxRate(BigDecimal marginalTaxRate) {
        this.marginalTaxRate = marginalTaxRate;
    }
    
    public List<TaxOptimizationSuggestion> getOptimizationSuggestions() {
        return optimizationSuggestions;
    }
    
    public void setOptimizationSuggestions(List<TaxOptimizationSuggestion> optimizationSuggestions) {
        this.optimizationSuggestions = optimizationSuggestions;
    }
    
    public BigDecimal getPotentialTaxSavings() {
        return potentialTaxSavings;
    }
    
    public void setPotentialTaxSavings(BigDecimal potentialTaxSavings) {
        this.potentialTaxSavings = potentialTaxSavings;
    }
    
    public TaxAdvantageAnalysis getTaxAdvantageAnalysis() {
        return taxAdvantageAnalysis;
    }
    
    public void setTaxAdvantageAnalysis(TaxAdvantageAnalysis taxAdvantageAnalysis) {
        this.taxAdvantageAnalysis = taxAdvantageAnalysis;
    }
    
    public LocalDateTime getCalculatedAt() {
        return calculatedAt;
    }
    
    public void setCalculatedAt(LocalDateTime calculatedAt) {
        this.calculatedAt = calculatedAt;
    }
    
    // Inner classes
    public static class TaxBracketInfo {
        private BigDecimal minIncome;
        private BigDecimal maxIncome;
        private BigDecimal rate;
        private BigDecimal taxOwed;
        
        public TaxBracketInfo() {}
        
        public TaxBracketInfo(BigDecimal minIncome, BigDecimal maxIncome, BigDecimal rate, BigDecimal taxOwed) {
            this.minIncome = minIncome;
            this.maxIncome = maxIncome;
            this.rate = rate;
            this.taxOwed = taxOwed;
        }
        
        // Getters and Setters
        public BigDecimal getMinIncome() {
            return minIncome;
        }
        
        public void setMinIncome(BigDecimal minIncome) {
            this.minIncome = minIncome;
        }
        
        public BigDecimal getMaxIncome() {
            return maxIncome;
        }
        
        public void setMaxIncome(BigDecimal maxIncome) {
            this.maxIncome = maxIncome;
        }
        
        public BigDecimal getRate() {
            return rate;
        }
        
        public void setRate(BigDecimal rate) {
            this.rate = rate;
        }
        
        public BigDecimal getTaxOwed() {
            return taxOwed;
        }
        
        public void setTaxOwed(BigDecimal taxOwed) {
            this.taxOwed = taxOwed;
        }
    }
    
    public static class TaxOptimizationSuggestion {
        private String category;
        private String suggestion;
        private BigDecimal potentialSavings;
        private String priority;
        private String description;
        
        public TaxOptimizationSuggestion() {}
        
        public TaxOptimizationSuggestion(String category, String suggestion, BigDecimal potentialSavings, String priority, String description) {
            this.category = category;
            this.suggestion = suggestion;
            this.potentialSavings = potentialSavings;
            this.priority = priority;
            this.description = description;
        }
        
        // Getters and Setters
        public String getCategory() {
            return category;
        }
        
        public void setCategory(String category) {
            this.category = category;
        }
        
        public String getSuggestion() {
            return suggestion;
        }
        
        public void setSuggestion(String suggestion) {
            this.suggestion = suggestion;
        }
        
        public BigDecimal getPotentialSavings() {
            return potentialSavings;
        }
        
        public void setPotentialSavings(BigDecimal potentialSavings) {
            this.potentialSavings = potentialSavings;
        }
        
        public String getPriority() {
            return priority;
        }
        
        public void setPriority(String priority) {
            this.priority = priority;
        }
        
        public String getDescription() {
            return description;
        }
        
        public void setDescription(String description) {
            this.description = description;
        }
    }
    
    public static class TaxAdvantageAnalysis {
        private Map<String, BigDecimal> currentContributions;
        private Map<String, BigDecimal> maxContributions;
        private Map<String, BigDecimal> remainingContributionRoom;
        private BigDecimal totalTaxSavingsFromContributions;
        
        public TaxAdvantageAnalysis() {}
        
        // Getters and Setters
        public Map<String, BigDecimal> getCurrentContributions() {
            return currentContributions;
        }
        
        public void setCurrentContributions(Map<String, BigDecimal> currentContributions) {
            this.currentContributions = currentContributions;
        }
        
        public Map<String, BigDecimal> getMaxContributions() {
            return maxContributions;
        }
        
        public void setMaxContributions(Map<String, BigDecimal> maxContributions) {
            this.maxContributions = maxContributions;
        }
        
        public Map<String, BigDecimal> getRemainingContributionRoom() {
            return remainingContributionRoom;
        }
        
        public void setRemainingContributionRoom(Map<String, BigDecimal> remainingContributionRoom) {
            this.remainingContributionRoom = remainingContributionRoom;
        }
        
        public BigDecimal getTotalTaxSavingsFromContributions() {
            return totalTaxSavingsFromContributions;
        }
        
        public void setTotalTaxSavingsFromContributions(BigDecimal totalTaxSavingsFromContributions) {
            this.totalTaxSavingsFromContributions = totalTaxSavingsFromContributions;
        }
    }
}