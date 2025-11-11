package com.budgettracker.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "exchange_rates", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"from_currency_id", "to_currency_id", "rate_date"}))
public class ExchangeRate {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "From currency is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_currency_id", nullable = false)
    private Currency fromCurrency;
    
    @NotNull(message = "To currency is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_currency_id", nullable = false)
    private Currency toCurrency;
    
    @NotNull(message = "Exchange rate is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Exchange rate must be positive")
    @Column(name = "rate", nullable = false, precision = 15, scale = 6)
    private BigDecimal rate;
    
    @NotNull(message = "Rate date is required")
    @Column(name = "rate_date", nullable = false)
    private LocalDate rateDate;
    
    @Column(name = "source", length = 50)
    private String source; // API source like "fixer.io", "exchangerate-api.com"
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors
    public ExchangeRate() {}
    
    public ExchangeRate(Currency fromCurrency, Currency toCurrency, BigDecimal rate, LocalDate rateDate) {
        this.fromCurrency = fromCurrency;
        this.toCurrency = toCurrency;
        this.rate = rate;
        this.rateDate = rateDate;
    }
    
    public ExchangeRate(Currency fromCurrency, Currency toCurrency, BigDecimal rate, LocalDate rateDate, String source) {
        this.fromCurrency = fromCurrency;
        this.toCurrency = toCurrency;
        this.rate = rate;
        this.rateDate = rateDate;
        this.source = source;
    }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Currency getFromCurrency() {
        return fromCurrency;
    }
    
    public void setFromCurrency(Currency fromCurrency) {
        this.fromCurrency = fromCurrency;
    }
    
    public Currency getToCurrency() {
        return toCurrency;
    }
    
    public void setToCurrency(Currency toCurrency) {
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
        return "ExchangeRate{" +
                "id=" + id +
                ", fromCurrency=" + (fromCurrency != null ? fromCurrency.getCode() : null) +
                ", toCurrency=" + (toCurrency != null ? toCurrency.getCode() : null) +
                ", rate=" + rate +
                ", rateDate=" + rateDate +
                ", source='" + source + '\'' +
                '}';
    }
}