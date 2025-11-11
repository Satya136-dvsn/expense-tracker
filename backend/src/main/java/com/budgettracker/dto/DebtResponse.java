package com.budgettracker.dto;

import com.budgettracker.model.Debt;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class DebtResponse {
    
    private Long id;
    private String name;
    private String description;
    private Debt.DebtType type;
    private BigDecimal currentBalance;
    private BigDecimal originalBalance;
    private BigDecimal interestRate;
    private BigDecimal minimumPayment;
    private Integer dueDate;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate paymentStartDate;
    
    private Debt.DebtStatus status;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime paidOffAt;
    
    // Calculated fields
    private BigDecimal monthlyInterestRate;
    private BigDecimal progressPercentage;
    private Boolean isPaidOff;
    
    // Constructors
    public DebtResponse() {}
    
    public DebtResponse(Debt debt) {
        this.id = debt.getId();
        this.name = debt.getName();
        this.description = debt.getDescription();
        this.type = debt.getType();
        this.currentBalance = debt.getCurrentBalance();
        this.originalBalance = debt.getOriginalBalance();
        this.interestRate = debt.getInterestRate();
        this.minimumPayment = debt.getMinimumPayment();
        this.dueDate = debt.getDueDate();
        this.paymentStartDate = debt.getPaymentStartDate();
        this.status = debt.getStatus();
        this.createdAt = debt.getCreatedAt();
        this.updatedAt = debt.getUpdatedAt();
        this.paidOffAt = debt.getPaidOffAt();
        
        // Calculated fields
        this.monthlyInterestRate = debt.getMonthlyInterestRate();
        this.progressPercentage = debt.getProgressPercentage();
        this.isPaidOff = debt.isPaidOff();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public Debt.DebtType getType() {
        return type;
    }
    
    public void setType(Debt.DebtType type) {
        this.type = type;
    }
    
    public BigDecimal getCurrentBalance() {
        return currentBalance;
    }
    
    public void setCurrentBalance(BigDecimal currentBalance) {
        this.currentBalance = currentBalance;
    }
    
    public BigDecimal getOriginalBalance() {
        return originalBalance;
    }
    
    public void setOriginalBalance(BigDecimal originalBalance) {
        this.originalBalance = originalBalance;
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
    
    public Integer getDueDate() {
        return dueDate;
    }
    
    public void setDueDate(Integer dueDate) {
        this.dueDate = dueDate;
    }
    
    public LocalDate getPaymentStartDate() {
        return paymentStartDate;
    }
    
    public void setPaymentStartDate(LocalDate paymentStartDate) {
        this.paymentStartDate = paymentStartDate;
    }
    
    public Debt.DebtStatus getStatus() {
        return status;
    }
    
    public void setStatus(Debt.DebtStatus status) {
        this.status = status;
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
    
    public LocalDateTime getPaidOffAt() {
        return paidOffAt;
    }
    
    public void setPaidOffAt(LocalDateTime paidOffAt) {
        this.paidOffAt = paidOffAt;
    }
    
    public BigDecimal getMonthlyInterestRate() {
        return monthlyInterestRate;
    }
    
    public void setMonthlyInterestRate(BigDecimal monthlyInterestRate) {
        this.monthlyInterestRate = monthlyInterestRate;
    }
    
    public BigDecimal getProgressPercentage() {
        return progressPercentage;
    }
    
    public void setProgressPercentage(BigDecimal progressPercentage) {
        this.progressPercentage = progressPercentage;
    }
    
    public Boolean getIsPaidOff() {
        return isPaidOff;
    }
    
    public void setIsPaidOff(Boolean isPaidOff) {
        this.isPaidOff = isPaidOff;
    }
}