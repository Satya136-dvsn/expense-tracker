package com.budgettracker.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class CurrencyConversionResponse {
    
    private BigDecimal originalAmount;
    private String fromCurrencyCode;
    private String fromCurrencySymbol;
    private BigDecimal convertedAmount;
    private String toCurrencyCode;
    private String toCurrencySymbol;
    private BigDecimal exchangeRate;
    private LocalDate conversionDate;
    private String rateSource;
    
    // Constructors
    public CurrencyConversionResponse() {}
    
    public CurrencyConversionResponse(BigDecimal originalAmount, String fromCurrencyCode, String fromCurrencySymbol,
                                    BigDecimal convertedAmount, String toCurrencyCode, String toCurrencySymbol,
                                    BigDecimal exchangeRate, LocalDate conversionDate) {
        this.originalAmount = originalAmount;
        this.fromCurrencyCode = fromCurrencyCode;
        this.fromCurrencySymbol = fromCurrencySymbol;
        this.convertedAmount = convertedAmount;
        this.toCurrencyCode = toCurrencyCode;
        this.toCurrencySymbol = toCurrencySymbol;
        this.exchangeRate = exchangeRate;
        this.conversionDate = conversionDate;
    }
    
    // Getters and Setters
    public BigDecimal getOriginalAmount() {
        return originalAmount;
    }
    
    public void setOriginalAmount(BigDecimal originalAmount) {
        this.originalAmount = originalAmount;
    }
    
    public String getFromCurrencyCode() {
        return fromCurrencyCode;
    }
    
    public void setFromCurrencyCode(String fromCurrencyCode) {
        this.fromCurrencyCode = fromCurrencyCode;
    }
    
    public String getFromCurrencySymbol() {
        return fromCurrencySymbol;
    }
    
    public void setFromCurrencySymbol(String fromCurrencySymbol) {
        this.fromCurrencySymbol = fromCurrencySymbol;
    }
    
    public BigDecimal getConvertedAmount() {
        return convertedAmount;
    }
    
    public void setConvertedAmount(BigDecimal convertedAmount) {
        this.convertedAmount = convertedAmount;
    }
    
    public String getToCurrencyCode() {
        return toCurrencyCode;
    }
    
    public void setToCurrencyCode(String toCurrencyCode) {
        this.toCurrencyCode = toCurrencyCode;
    }
    
    public String getToCurrencySymbol() {
        return toCurrencySymbol;
    }
    
    public void setToCurrencySymbol(String toCurrencySymbol) {
        this.toCurrencySymbol = toCurrencySymbol;
    }
    
    public BigDecimal getExchangeRate() {
        return exchangeRate;
    }
    
    public void setExchangeRate(BigDecimal exchangeRate) {
        this.exchangeRate = exchangeRate;
    }
    
    public LocalDate getConversionDate() {
        return conversionDate;
    }
    
    public void setConversionDate(LocalDate conversionDate) {
        this.conversionDate = conversionDate;
    }
    
    public String getRateSource() {
        return rateSource;
    }
    
    public void setRateSource(String rateSource) {
        this.rateSource = rateSource;
    }
    
    @Override
    public String toString() {
        return "CurrencyConversionResponse{" +
                "originalAmount=" + originalAmount +
                ", fromCurrencyCode='" + fromCurrencyCode + '\'' +
                ", convertedAmount=" + convertedAmount +
                ", toCurrencyCode='" + toCurrencyCode + '\'' +
                ", exchangeRate=" + exchangeRate +
                ", conversionDate=" + conversionDate +
                '}';
    }
}