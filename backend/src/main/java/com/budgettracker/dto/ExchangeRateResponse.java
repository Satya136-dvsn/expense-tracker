package com.budgettracker.dto;

import com.budgettracker.model.ExchangeRate;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ExchangeRateResponse {
    
    private Long id;
    private CurrencyResponse fromCurrency;
    private CurrencyResponse toCurrency;
    private BigDecimal rate;
    private LocalDate rateDate;
    private String source;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructors
    public ExchangeRateResponse() {}
    
    public ExchangeRateResponse(ExchangeRate exchangeRate) {
        this.id = exchangeRate.getId();
        this.fromCurrency = new CurrencyResponse(exchangeRate.getFromCurrency());
        this.toCurrency = new CurrencyResponse(exchangeRate.getToCurrency());
        this.rate = exchangeRate.getRate();
        this.rateDate = exchangeRate.getRateDate();
        this.source = exchangeRate.getSource();
        this.createdAt = exchangeRate.getCreatedAt();
        this.updatedAt = exchangeRate.getUpdatedAt();
    }
    
    // Static factory method
    public static ExchangeRateResponse fromEntity(ExchangeRate exchangeRate) {
        return new ExchangeRateResponse(exchangeRate);
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public CurrencyResponse getFromCurrency() {
        return fromCurrency;
    }
    
    public void setFromCurrency(CurrencyResponse fromCurrency) {
        this.fromCurrency = fromCurrency;
    }
    
    public CurrencyResponse getToCurrency() {
        return toCurrency;
    }
    
    public void setToCurrency(CurrencyResponse toCurrency) {
        this.toCurrency = toCurrency;
    }
    
    public BigDecimal getRate() {
        return rate;
    }
    
    public void setRate(BigDecimal rate) {
        this.rate = rate;
    }
    
    public LocalDate getRateDate() {
        return rateDate;
    }
    
    public void setRateDate(LocalDate rateDate) {
        this.rateDate = rateDate;
    }
    
    public String getSource() {
        return source;
    }
    
    public void setSource(String source) {
        this.source = source;
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
    
    @Override
    public String toString() {
        return "ExchangeRateResponse{" +
                "id=" + id +
                ", fromCurrency=" + (fromCurrency != null ? fromCurrency.getCode() : null) +
                ", toCurrency=" + (toCurrency != null ? toCurrency.getCode() : null) +
                ", rate=" + rate +
                ", rateDate=" + rateDate +
                ", source='" + source + '\'' +
                '}';
    }
}