package com.budgettracker.dto;

import com.budgettracker.model.Currency;
import java.time.LocalDateTime;

public class CurrencyResponse {
    
    private Long id;
    private String code;
    private String name;
    private String symbol;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructors
    public CurrencyResponse() {}
    
    public CurrencyResponse(Currency currency) {
        this.id = currency.getId();
        this.code = currency.getCode();
        this.name = currency.getName();
        this.symbol = currency.getSymbol();
        this.isActive = currency.getIsActive();
        this.createdAt = currency.getCreatedAt();
        this.updatedAt = currency.getUpdatedAt();
    }
    
    public CurrencyResponse(Long id, String code, String name, String symbol, Boolean isActive) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.symbol = symbol;
        this.isActive = isActive;
    }
    
    // Static factory method
    public static CurrencyResponse fromEntity(Currency currency) {
        return new CurrencyResponse(currency);
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getCode() {
        return code;
    }
    
    public void setCode(String code) {
        this.code = code;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getSymbol() {
        return symbol;
    }
    
    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
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
        return "CurrencyResponse{" +
                "id=" + id +
                ", code='" + code + '\'' +
                ", name='" + name + '\'' +
                ", symbol='" + symbol + '\'' +
                ", isActive=" + isActive +
                '}';
    }
}