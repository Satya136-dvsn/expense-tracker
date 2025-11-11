package com.budgettracker.dto;

import java.math.BigDecimal;

public class UserProfileUpdateRequest {
    
    private BigDecimal monthlyIncome;
    private BigDecimal currentSavings;
    private BigDecimal targetExpenses;
    
    // Constructors
    public UserProfileUpdateRequest() {}
    
    public UserProfileUpdateRequest(BigDecimal monthlyIncome, BigDecimal currentSavings, BigDecimal targetExpenses) {
        this.monthlyIncome = monthlyIncome;
        this.currentSavings = currentSavings;
        this.targetExpenses = targetExpenses;
    }
    
    // Getters and Setters
    public BigDecimal getMonthlyIncome() {
        return monthlyIncome;
    }
    
    public void setMonthlyIncome(BigDecimal monthlyIncome) {
        this.monthlyIncome = monthlyIncome;
    }
    
    public BigDecimal getCurrentSavings() {
        return currentSavings;
    }
    
    public void setCurrentSavings(BigDecimal currentSavings) {
        this.currentSavings = currentSavings;
    }
    
    public BigDecimal getTargetExpenses() {
        return targetExpenses;
    }
    
    public void setTargetExpenses(BigDecimal targetExpenses) {
        this.targetExpenses = targetExpenses;
    }
}
