package com.budgettracker.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public class DebtOptimizationRequest {
    
    @NotNull(message = "Extra payment amount is required")
    @DecimalMin(value = "0.00", message = "Extra payment amount must be greater than or equal to 0")
    @Digits(integer = 10, fraction = 2, message = "Extra payment amount must have at most 10 integer digits and 2 decimal places")
    private BigDecimal extraPaymentAmount;
    
    private List<Long> debtIds; // Optional: specific debts to include in optimization
    
    // Constructors
    public DebtOptimizationRequest() {}
    
    public DebtOptimizationRequest(BigDecimal extraPaymentAmount) {
        this.extraPaymentAmount = extraPaymentAmount;
    }
    
    public DebtOptimizationRequest(BigDecimal extraPaymentAmount, List<Long> debtIds) {
        this.extraPaymentAmount = extraPaymentAmount;
        this.debtIds = debtIds;
    }
    
    // Getters and Setters
    public BigDecimal getExtraPaymentAmount() {
        return extraPaymentAmount;
    }
    
    public void setExtraPaymentAmount(BigDecimal extraPaymentAmount) {
        this.extraPaymentAmount = extraPaymentAmount;
    }
    
    public List<Long> getDebtIds() {
        return debtIds;
    }
    
    public void setDebtIds(List<Long> debtIds) {
        this.debtIds = debtIds;
    }
}