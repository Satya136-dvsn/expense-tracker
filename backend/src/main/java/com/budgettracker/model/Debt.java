package com.budgettracker.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "debts")
public class Debt {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DebtType type;
    
    @Column(name = "current_balance", nullable = false, precision = 10, scale = 2)
    private BigDecimal currentBalance;
    
    @Column(name = "original_balance", precision = 10, scale = 2)
    private BigDecimal originalBalance;
    
    @Column(name = "interest_rate", nullable = false, precision = 5, scale = 4)
    private BigDecimal interestRate;
    
    @Column(name = "minimum_payment", nullable = false, precision = 10, scale = 2)
    private BigDecimal minimumPayment;
    
    @Column(name = "due_date")
    private Integer dueDate; // Day of month (1-31)
    
    @Column(name = "payment_start_date")
    private LocalDate paymentStartDate;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DebtStatus status = DebtStatus.ACTIVE;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "paid_off_at")
    private LocalDateTime paidOffAt;
    
    // Constructors
    public Debt() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.status = DebtStatus.ACTIVE;
    }
    
    public Debt(User user, String name, String description, DebtType type, 
                BigDecimal currentBalance, BigDecimal interestRate, BigDecimal minimumPayment) {
        this();
        this.user = user;
        this.name = name;
        this.description = description;
        this.type = type;
        this.currentBalance = currentBalance;
        this.originalBalance = currentBalance;
        this.interestRate = interestRate;
        this.minimumPayment = minimumPayment;
    }
    
    // Calculated fields
    @Transient
    public BigDecimal getMonthlyInterestRate() {
        return interestRate.divide(new BigDecimal("12"), 6, java.math.RoundingMode.HALF_UP);
    }
    
    @Transient
    public BigDecimal getProgressPercentage() {
        if (originalBalance == null || originalBalance.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        BigDecimal paidAmount = originalBalance.subtract(currentBalance);
        return paidAmount.divide(originalBalance, 4, java.math.RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"));
    }
    
    @Transient
    public Boolean isPaidOff() {
        return status == DebtStatus.PAID_OFF || currentBalance.compareTo(BigDecimal.ZERO) <= 0;
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
    
    public DebtType getType() {
        return type;
    }
    
    public void setType(DebtType type) {
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
    
    public DebtStatus getStatus() {
        return status;
    }
    
    public void setStatus(DebtStatus status) {
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
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    // Enums
    public enum DebtType {
        CREDIT_CARD,
        PERSONAL_LOAN,
        STUDENT_LOAN,
        MORTGAGE,
        AUTO_LOAN,
        HOME_EQUITY_LOAN,
        BUSINESS_LOAN,
        OTHER
    }
    
    public enum DebtStatus {
        ACTIVE,
        PAID_OFF,
        DEFERRED,
        IN_DEFAULT
    }
}