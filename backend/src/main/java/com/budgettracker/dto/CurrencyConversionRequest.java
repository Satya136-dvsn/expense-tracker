package com.budgettracker.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public class CurrencyConversionRequest {
    
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Amount must be positive")
    private BigDecimal amount;
    
    @NotBlank(message = "From currency code is required")
    @Size(min = 3, max = 3, message = "From currency code must be exactly 3 characters")
    private String fromCurrencyCode;
    
    @NotBlank(message = "To currency code is required")
    @Size(min = 3, max = 3, message = "To currency code must be exactly 3 characters")
    private String toCurrencyCode;
    
    private LocalDate conversionDate; // Optional, defaults to current date
    
    // Constructors
    public CurrencyConversionRequest() {}
    
    public CurrencyConversionRequest(BigDecimal amount, String fromCurrencyCode, String toCurrencyCode) {
        this.amount = amount;
        this.fromCurrencyCode = fromCurrencyCode;
        this.toCurrencyCode = toCurrencyCode;
    }
    
    public CurrencyConversionRequest(BigDecimal amount, String fromCurrencyCode, String toCurrencyCode, LocalDate conversionDate) {
        this.amount = amount;
        this.fromCurrencyCode = fromCurrencyCode;
        this.toCurrencyCode = toCurrencyCode;
        this.conversionDate = conversionDate;
    }
    
    // Getters and Setters
    public BigDecimal getAmount() {
        return amount;
    }
    
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
    
    public String getFromCurrencyCode() {
        return fromCurrencyCode;
    }
    
    public void setFromCurrencyCode(String fromCurrencyCode) {
        this.fromCurrencyCode = fromCurrencyCode;
    }
    
    public String getToCurrencyCode() {
        return toCurrencyCode;
    }
    
    public void setToCurrencyCode(String toCurrencyCode) {
        this.toCurrencyCode = toCurrencyCode;
    }
    
    public LocalDate getConversionDate() {
        return conversionDate;
    }
    
    public void setConversionDate(LocalDate conversionDate) {
        this.conversionDate = conversionDate;
    }
    
    @Override
    public String toString() {
        return "CurrencyConversionRequest{" +
                "amount=" + amount +
                ", fromCurrencyCode='" + fromCurrencyCode + '\'' +
                ", toCurrencyCode='" + toCurrencyCode + '\'' +
                ", conversionDate=" + conversionDate +
                '}';
    }
}