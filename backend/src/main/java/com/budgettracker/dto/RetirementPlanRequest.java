package com.budgettracker.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class RetirementPlanRequest {
    @NotNull(message = "Current age is required")
    @Min(value = 18, message = "Current age must be at least 18")
    @Max(value = 100, message = "Current age must be less than 100")
    private Integer currentAge;

    @NotNull(message = "Retirement age is required")
    @Min(value = 50, message = "Retirement age must be at least 50")
    @Max(value = 100, message = "Retirement age must be less than 100")
    private Integer retirementAge;

    @DecimalMin(value = "0.0", message = "Current annual income must be non-negative")
    private BigDecimal currentAnnualIncome;

    @DecimalMin(value = "0.0", message = "Desired replacement ratio must be non-negative")
    @DecimalMax(value = "2.0", message = "Desired replacement ratio must be less than 200%")
    private BigDecimal desiredReplacementRatio;

    @DecimalMin(value = "0.0", message = "Current 401k balance must be non-negative")
    private BigDecimal current401kBalance;

    @DecimalMin(value = "0.0", message = "Current IRA balance must be non-negative")
    private BigDecimal currentIraBalance;

    @DecimalMin(value = "0.0", message = "Other retirement savings must be non-negative")
    private BigDecimal otherRetirementSavings;

    @DecimalMin(value = "0.0", message = "Monthly 401k contribution must be non-negative")
    private BigDecimal monthly401kContribution;

    @DecimalMin(value = "0.0", message = "Monthly IRA contribution must be non-negative")
    private BigDecimal monthlyIraContribution;

    @DecimalMin(value = "0.0", message = "Employer match rate must be non-negative")
    @DecimalMax(value = "1.0", message = "Employer match rate must be less than 100%")
    private BigDecimal employerMatchRate;

    @DecimalMin(value = "0.0", message = "Employer match limit must be non-negative")
    @DecimalMax(value = "1.0", message = "Employer match limit must be less than 100%")
    private BigDecimal employerMatchLimit;

    @DecimalMin(value = "0.0", message = "Expected annual return must be non-negative")
    @DecimalMax(value = "0.5", message = "Expected annual return must be less than 50%")
    private BigDecimal expectedAnnualReturn;

    @DecimalMin(value = "0.0", message = "Expected inflation rate must be non-negative")
    @DecimalMax(value = "0.2", message = "Expected inflation rate must be less than 20%")
    private BigDecimal expectedInflationRate;

    @DecimalMin(value = "0.0", message = "Social Security benefit must be non-negative")
    private BigDecimal socialSecurityBenefit;

    @NotNull(message = "Life expectancy is required")
    @Min(value = 60, message = "Life expectancy must be at least 60")
    @Max(value = 120, message = "Life expectancy must be less than 120")
    private Integer lifeExpectancy;

    // Constructors
    public RetirementPlanRequest() {}

    // Getters and Setters
    public Integer getCurrentAge() {
        return currentAge;
    }

    public void setCurrentAge(Integer currentAge) {
        this.currentAge = currentAge;
    }

    public Integer getRetirementAge() {
        return retirementAge;
    }

    public void setRetirementAge(Integer retirementAge) {
        this.retirementAge = retirementAge;
    }

    public BigDecimal getCurrentAnnualIncome() {
        return currentAnnualIncome;
    }

    public void setCurrentAnnualIncome(BigDecimal currentAnnualIncome) {
        this.currentAnnualIncome = currentAnnualIncome;
    }

    public BigDecimal getDesiredReplacementRatio() {
        return desiredReplacementRatio;
    }

    public void setDesiredReplacementRatio(BigDecimal desiredReplacementRatio) {
        this.desiredReplacementRatio = desiredReplacementRatio;
    }

    public BigDecimal getCurrent401kBalance() {
        return current401kBalance;
    }

    public void setCurrent401kBalance(BigDecimal current401kBalance) {
        this.current401kBalance = current401kBalance;
    }

    public BigDecimal getCurrentIraBalance() {
        return currentIraBalance;
    }

    public void setCurrentIraBalance(BigDecimal currentIraBalance) {
        this.currentIraBalance = currentIraBalance;
    }

    public BigDecimal getOtherRetirementSavings() {
        return otherRetirementSavings;
    }

    public void setOtherRetirementSavings(BigDecimal otherRetirementSavings) {
        this.otherRetirementSavings = otherRetirementSavings;
    }

    public BigDecimal getMonthly401kContribution() {
        return monthly401kContribution;
    }

    public void setMonthly401kContribution(BigDecimal monthly401kContribution) {
        this.monthly401kContribution = monthly401kContribution;
    }

    public BigDecimal getMonthlyIraContribution() {
        return monthlyIraContribution;
    }

    public void setMonthlyIraContribution(BigDecimal monthlyIraContribution) {
        this.monthlyIraContribution = monthlyIraContribution;
    }

    public BigDecimal getEmployerMatchRate() {
        return employerMatchRate;
    }

    public void setEmployerMatchRate(BigDecimal employerMatchRate) {
        this.employerMatchRate = employerMatchRate;
    }

    public BigDecimal getEmployerMatchLimit() {
        return employerMatchLimit;
    }

    public void setEmployerMatchLimit(BigDecimal employerMatchLimit) {
        this.employerMatchLimit = employerMatchLimit;
    }

    public BigDecimal getExpectedAnnualReturn() {
        return expectedAnnualReturn;
    }

    public void setExpectedAnnualReturn(BigDecimal expectedAnnualReturn) {
        this.expectedAnnualReturn = expectedAnnualReturn;
    }

    public BigDecimal getExpectedInflationRate() {
        return expectedInflationRate;
    }

    public void setExpectedInflationRate(BigDecimal expectedInflationRate) {
        this.expectedInflationRate = expectedInflationRate;
    }

    public BigDecimal getSocialSecurityBenefit() {
        return socialSecurityBenefit;
    }

    public void setSocialSecurityBenefit(BigDecimal socialSecurityBenefit) {
        this.socialSecurityBenefit = socialSecurityBenefit;
    }

    public Integer getLifeExpectancy() {
        return lifeExpectancy;
    }

    public void setLifeExpectancy(Integer lifeExpectancy) {
        this.lifeExpectancy = lifeExpectancy;
    }
}