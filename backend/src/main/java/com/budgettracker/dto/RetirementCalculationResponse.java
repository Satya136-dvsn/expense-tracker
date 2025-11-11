package com.budgettracker.dto;

import java.math.BigDecimal;
import java.util.List;

public class RetirementCalculationResponse {
    private Long planId;
    private BigDecimal projectedRetirementBalance;
    private BigDecimal monthlyRetirementIncome;
    private BigDecimal requiredMonthlyIncome;
    private BigDecimal incomeShortfall;
    private BigDecimal replacementRatio;
    private String retirementReadiness;
    private BigDecimal recommendedMonthlySavings;
    private RetirementBreakdown breakdown;
    private List<YearlyProjection> yearlyProjections;

    // Nested classes for detailed breakdown
    public static class RetirementBreakdown {
        private BigDecimal total401kBalance;
        private BigDecimal totalIraBalance;
        private BigDecimal totalOtherSavings;
        private BigDecimal totalEmployerMatch;
        private BigDecimal socialSecurityValue;
        private BigDecimal inflationAdjustedIncome;

        // Constructors
        public RetirementBreakdown() {}

        // Getters and Setters
        public BigDecimal getTotal401kBalance() {
            return total401kBalance;
        }

        public void setTotal401kBalance(BigDecimal total401kBalance) {
            this.total401kBalance = total401kBalance;
        }

        public BigDecimal getTotalIraBalance() {
            return totalIraBalance;
        }

        public void setTotalIraBalance(BigDecimal totalIraBalance) {
            this.totalIraBalance = totalIraBalance;
        }

        public BigDecimal getTotalOtherSavings() {
            return totalOtherSavings;
        }

        public void setTotalOtherSavings(BigDecimal totalOtherSavings) {
            this.totalOtherSavings = totalOtherSavings;
        }

        public BigDecimal getTotalEmployerMatch() {
            return totalEmployerMatch;
        }

        public void setTotalEmployerMatch(BigDecimal totalEmployerMatch) {
            this.totalEmployerMatch = totalEmployerMatch;
        }

        public BigDecimal getSocialSecurityValue() {
            return socialSecurityValue;
        }

        public void setSocialSecurityValue(BigDecimal socialSecurityValue) {
            this.socialSecurityValue = socialSecurityValue;
        }

        public BigDecimal getInflationAdjustedIncome() {
            return inflationAdjustedIncome;
        }

        public void setInflationAdjustedIncome(BigDecimal inflationAdjustedIncome) {
            this.inflationAdjustedIncome = inflationAdjustedIncome;
        }
    }

    public static class YearlyProjection {
        private Integer year;
        private Integer age;
        private BigDecimal total401kBalance;
        private BigDecimal totalIraBalance;
        private BigDecimal totalOtherSavings;
        private BigDecimal totalBalance;
        private BigDecimal annualContributions;
        private BigDecimal employerMatch;

        // Constructors
        public YearlyProjection() {}

        public YearlyProjection(Integer year, Integer age) {
            this.year = year;
            this.age = age;
        }

        // Getters and Setters
        public Integer getYear() {
            return year;
        }

        public void setYear(Integer year) {
            this.year = year;
        }

        public Integer getAge() {
            return age;
        }

        public void setAge(Integer age) {
            this.age = age;
        }

        public BigDecimal getTotal401kBalance() {
            return total401kBalance;
        }

        public void setTotal401kBalance(BigDecimal total401kBalance) {
            this.total401kBalance = total401kBalance;
        }

        public BigDecimal getTotalIraBalance() {
            return totalIraBalance;
        }

        public void setTotalIraBalance(BigDecimal totalIraBalance) {
            this.totalIraBalance = totalIraBalance;
        }

        public BigDecimal getTotalOtherSavings() {
            return totalOtherSavings;
        }

        public void setTotalOtherSavings(BigDecimal totalOtherSavings) {
            this.totalOtherSavings = totalOtherSavings;
        }

        public BigDecimal getTotalBalance() {
            return totalBalance;
        }

        public void setTotalBalance(BigDecimal totalBalance) {
            this.totalBalance = totalBalance;
        }

        public BigDecimal getAnnualContributions() {
            return annualContributions;
        }

        public void setAnnualContributions(BigDecimal annualContributions) {
            this.annualContributions = annualContributions;
        }

        public BigDecimal getEmployerMatch() {
            return employerMatch;
        }

        public void setEmployerMatch(BigDecimal employerMatch) {
            this.employerMatch = employerMatch;
        }
    }

    // Constructors
    public RetirementCalculationResponse() {}

    // Getters and Setters
    public Long getPlanId() {
        return planId;
    }

    public void setPlanId(Long planId) {
        this.planId = planId;
    }

    public BigDecimal getProjectedRetirementBalance() {
        return projectedRetirementBalance;
    }

    public void setProjectedRetirementBalance(BigDecimal projectedRetirementBalance) {
        this.projectedRetirementBalance = projectedRetirementBalance;
    }

    public BigDecimal getMonthlyRetirementIncome() {
        return monthlyRetirementIncome;
    }

    public void setMonthlyRetirementIncome(BigDecimal monthlyRetirementIncome) {
        this.monthlyRetirementIncome = monthlyRetirementIncome;
    }

    public BigDecimal getRequiredMonthlyIncome() {
        return requiredMonthlyIncome;
    }

    public void setRequiredMonthlyIncome(BigDecimal requiredMonthlyIncome) {
        this.requiredMonthlyIncome = requiredMonthlyIncome;
    }

    public BigDecimal getIncomeShortfall() {
        return incomeShortfall;
    }

    public void setIncomeShortfall(BigDecimal incomeShortfall) {
        this.incomeShortfall = incomeShortfall;
    }

    public BigDecimal getReplacementRatio() {
        return replacementRatio;
    }

    public void setReplacementRatio(BigDecimal replacementRatio) {
        this.replacementRatio = replacementRatio;
    }

    public String getRetirementReadiness() {
        return retirementReadiness;
    }

    public void setRetirementReadiness(String retirementReadiness) {
        this.retirementReadiness = retirementReadiness;
    }

    public BigDecimal getRecommendedMonthlySavings() {
        return recommendedMonthlySavings;
    }

    public void setRecommendedMonthlySavings(BigDecimal recommendedMonthlySavings) {
        this.recommendedMonthlySavings = recommendedMonthlySavings;
    }

    public RetirementBreakdown getBreakdown() {
        return breakdown;
    }

    public void setBreakdown(RetirementBreakdown breakdown) {
        this.breakdown = breakdown;
    }

    public List<YearlyProjection> getYearlyProjections() {
        return yearlyProjections;
    }

    public void setYearlyProjections(List<YearlyProjection> yearlyProjections) {
        this.yearlyProjections = yearlyProjections;
    }
}