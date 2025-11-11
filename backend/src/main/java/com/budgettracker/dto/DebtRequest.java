package com.budgettracker.dto;

import com.budgettracker.model.Debt;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public class DebtRequest {
    
    @NotBlank(message = "Debt name is required")
    @Size(max = 255, message = "Debt name must not exceed 255 characters")
    private String name;
    
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;
    
    @NotNull(message = "Debt type is required")
    private Debt.DebtType type;
    
    @NotNull(message = "Current balance is required")
    @DecimalMin(value = "0.00", message = "Current balance must be greater than or equal to 0")
    @Digits(integer = 10, fraction = 2, message = "Current balance must have at most 10 integer digits and 2 decimal places")
    private BigDecimal currentBalance;
    
    @Digits(integer = 10, fraction = 2, message = "Original balance must have at most 10 integer digits and 2 decimal places")
    private BigDecimal originalBalance;
    
    @NotNull(message = "Interest rate is required")
    @DecimalMin(value = "0.0000", message = "Interest rate must be greater than or equal to 0")
    @DecimalMax(value = "100.0000", message = "Interest rate must be less than or equal to 100")
    @Digits(integer = 3, fraction = 4, message = "Interest rate must have at most 3 integer digits and 4 decimal places")
    private BigDecimal interestRate;
    
    @NotNull(message = "Minimum payment is required")
    @DecimalMin(value = "0.01", message = "Minimum payment must be greater than 0")
    @Digits(integer = 10, fraction = 2, message = "Minimum payment must have at most 10 integer digits and 2 decimal places")
    private BigDecimal minimumPayment;
    
    @Min(value = 1, message = "Due date must be between 1 and 31")
    @Max(value = 31, message = "Due date must be between 1 and 31")
    private Integer dueDate;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate paymentStartDate;
    
    // Constructors
    public DebtRequest() {}
    
    public DebtRequest(String name, String description, Debt.DebtType type, 
                       BigDecimal currentBalance, BigDecimal interestRate, BigDecimal minimumPayment) {
        this.name = name;
        this.description = description;
        this.type = type;
        this.currentBalance = currentBalance;
        this.interestRate = interestRate;
        this.minimumPayment = minimumPayment;
    }
    
    // Getters and Setters
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
}