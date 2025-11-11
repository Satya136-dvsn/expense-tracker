package com.budgettracker.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bills")
public class Bill {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @NotBlank(message = "Bill name is required")
    @Size(max = 255, message = "Bill name must not exceed 255 characters")
    @Column(name = "name", nullable = false)
    private String name;
    
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    @Column(name = "description")
    private String description;
    
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    @Digits(integer = 10, fraction = 2, message = "Amount must have at most 10 integer digits and 2 decimal places")
    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;
    
    @NotNull(message = "Category is required")
    @Column(name = "category", nullable = false)
    private String category;
    
    @NotNull(message = "Frequency is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "frequency", nullable = false)
    private BillFrequency frequency;
    
    @NotNull(message = "Due date is required")
    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;
    
    @Column(name = "next_due_date")
    private LocalDate nextDueDate;
    
    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private BillStatus status = BillStatus.ACTIVE;
    
    @Column(name = "auto_pay", nullable = false)
    private Boolean autoPay = false;
    
    @Column(name = "reminder_days_before")
    private Integer reminderDaysBefore = 3;
    
    @Column(name = "payee")
    private String payee;
    
    @Column(name = "account_number")
    private String accountNumber;
    
    @Column(name = "website_url")
    private String websiteUrl;
    
    @Column(name = "notes")
    private String notes;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    // Constructors
    public Bill() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public Bill(Long userId, String name, BigDecimal amount, String category, 
                BillFrequency frequency, LocalDate dueDate) {
        this();
        this.userId = userId;
        this.name = name;
        this.amount = amount;
        this.category = category;
        this.frequency = frequency;
        this.dueDate = dueDate;
        this.nextDueDate = calculateNextDueDate(dueDate, frequency);
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    // Helper method to calculate next due date
    private LocalDate calculateNextDueDate(LocalDate currentDue, BillFrequency freq) {
        if (currentDue == null || freq == null) {
            return null;
        }
        
        LocalDate today = LocalDate.now();
        LocalDate nextDue = currentDue;
        
        // Calculate next due date based on frequency
        while (nextDue.isBefore(today) || nextDue.isEqual(today)) {
            switch (freq) {
                case WEEKLY:
                    nextDue = nextDue.plusWeeks(1);
                    break;
                case BI_WEEKLY:
                    nextDue = nextDue.plusWeeks(2);
                    break;
                case MONTHLY:
                    nextDue = nextDue.plusMonths(1);
                    break;
                case QUARTERLY:
                    nextDue = nextDue.plusMonths(3);
                    break;
                case SEMI_ANNUALLY:
                    nextDue = nextDue.plusMonths(6);
                    break;
                case ANNUALLY:
                    nextDue = nextDue.plusYears(1);
                    break;
                case ONE_TIME:
                    return currentDue;
            }
        }
        
        return nextDue;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
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
    
    public BigDecimal getAmount() {
        return amount;
    }
    
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public BillFrequency getFrequency() {
        return frequency;
    }
    
    public void setFrequency(BillFrequency frequency) {
        this.frequency = frequency;
        // Recalculate next due date when frequency changes
        if (this.dueDate != null) {
            this.nextDueDate = calculateNextDueDate(this.dueDate, frequency);
        }
    }
    
    public LocalDate getDueDate() {
        return dueDate;
    }
    
    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
        // Recalculate next due date when due date changes
        if (this.frequency != null) {
            this.nextDueDate = calculateNextDueDate(dueDate, this.frequency);
        }
    }
    
    public LocalDate getNextDueDate() {
        return nextDueDate;
    }
    
    public void setNextDueDate(LocalDate nextDueDate) {
        this.nextDueDate = nextDueDate;
    }
    
    public BillStatus getStatus() {
        return status;
    }
    
    public void setStatus(BillStatus status) {
        this.status = status;
    }
    
    public Boolean getAutoPay() {
        return autoPay;
    }
    
    public void setAutoPay(Boolean autoPay) {
        this.autoPay = autoPay;
    }
    
    public Integer getReminderDaysBefore() {
        return reminderDaysBefore;
    }
    
    public void setReminderDaysBefore(Integer reminderDaysBefore) {
        this.reminderDaysBefore = reminderDaysBefore;
    }
    
    public String getPayee() {
        return payee;
    }
    
    public void setPayee(String payee) {
        this.payee = payee;
    }
    
    public String getAccountNumber() {
        return accountNumber;
    }
    
    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }
    
    public String getWebsiteUrl() {
        return websiteUrl;
    }
    
    public void setWebsiteUrl(String websiteUrl) {
        this.websiteUrl = websiteUrl;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
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
    
    // Enums
    public enum BillFrequency {
        ONE_TIME,
        WEEKLY,
        BI_WEEKLY,
        MONTHLY,
        QUARTERLY,
        SEMI_ANNUALLY,
        ANNUALLY
    }
    
    public enum BillStatus {
        ACTIVE,
        INACTIVE,
        PAID_OFF,
        OVERDUE
    }
}