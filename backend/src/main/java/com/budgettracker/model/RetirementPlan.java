package com.budgettracker.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "retirement_plans")
public class RetirementPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "current_age", nullable = false)
    private Integer currentAge;

    @Column(name = "retirement_age", nullable = false)
    private Integer retirementAge;

    @Column(name = "current_annual_income", precision = 15, scale = 2)
    private BigDecimal currentAnnualIncome;

    @Column(name = "desired_replacement_ratio", precision = 5, scale = 4)
    private BigDecimal desiredReplacementRatio;

    @Column(name = "current_401k_balance", precision = 15, scale = 2)
    private BigDecimal current401kBalance;

    @Column(name = "current_ira_balance", precision = 15, scale = 2)
    private BigDecimal currentIraBalance;

    @Column(name = "other_retirement_savings", precision = 15, scale = 2)
    private BigDecimal otherRetirementSavings;

    @Column(name = "monthly_401k_contribution", precision = 10, scale = 2)
    private BigDecimal monthly401kContribution;

    @Column(name = "monthly_ira_contribution", precision = 10, scale = 2)
    private BigDecimal monthlyIraContribution;

    @Column(name = "employer_match_rate", precision = 5, scale = 4)
    private BigDecimal employerMatchRate;

    @Column(name = "employer_match_limit", precision = 5, scale = 4)
    private BigDecimal employerMatchLimit;

    @Column(name = "expected_annual_return", precision = 5, scale = 4)
    private BigDecimal expectedAnnualReturn;

    @Column(name = "expected_inflation_rate", precision = 5, scale = 4)
    private BigDecimal expectedInflationRate;

    @Column(name = "social_security_benefit", precision = 10, scale = 2)
    private BigDecimal socialSecurityBenefit;

    @Column(name = "life_expectancy", nullable = false)
    private Integer lifeExpectancy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Constructors
    public RetirementPlan() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public RetirementPlan(User user, Integer currentAge, Integer retirementAge) {
        this();
        this.user = user;
        this.currentAge = currentAge;
        this.retirementAge = retirementAge;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}