package com.budgettracker.dto;

import com.budgettracker.model.Bill;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class BillResponse {
    
    private Long id;
    private String name;
    private String description;
    private BigDecimal amount;
    private String category;
    private Bill.BillFrequency frequency;
    private LocalDate dueDate;
    private LocalDate nextDueDate;
    private Bill.BillStatus status;
    private Boolean autoPay;
    private Integer reminderDaysBefore;
    private String payee;
    private String accountNumber;
    private String websiteUrl;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Additional computed fields
    private Integer daysUntilDue;
    private Boolean isOverdue;
    private Boolean isDueToday;
    private Boolean needsReminder;
    
    // Constructors
    public BillResponse() {}
    
    public BillResponse(Bill bill) {
        this.id = bill.getId();
        this.name = bill.getName();
        this.description = bill.getDescription();
        this.amount = bill.getAmount();
        this.category = bill.getCategory();
        this.frequency = bill.getFrequency();
        this.dueDate = bill.getDueDate();
        this.nextDueDate = bill.getNextDueDate();
        this.status = bill.getStatus();
        this.autoPay = bill.getAutoPay();
        this.reminderDaysBefore = bill.getReminderDaysBefore();
        this.payee = bill.getPayee();
        this.accountNumber = bill.getAccountNumber();
        this.websiteUrl = bill.getWebsiteUrl();
        this.notes = bill.getNotes();
        this.createdAt = bill.getCreatedAt();
        this.updatedAt = bill.getUpdatedAt();
        
        // Calculate computed fields
        calculateComputedFields();
    }
    
    private void calculateComputedFields() {
        LocalDate today = LocalDate.now();
        
        if (nextDueDate != null) {
            this.daysUntilDue = (int) today.until(nextDueDate).getDays();
            this.isOverdue = nextDueDate.isBefore(today);
            this.isDueToday = nextDueDate.isEqual(today);
            this.needsReminder = reminderDaysBefore != null && 
                               daysUntilDue <= reminderDaysBefore && 
                               daysUntilDue >= 0;
        } else {
            this.daysUntilDue = null;
            this.isOverdue = false;
            this.isDueToday = false;
            this.needsReminder = false;
        }
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
    
    public Bill.BillFrequency getFrequency() {
        return frequency;
    }
    
    public void setFrequency(Bill.BillFrequency frequency) {
        this.frequency = frequency;
    }
    
    public LocalDate getDueDate() {
        return dueDate;
    }
    
    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }
    
    public LocalDate getNextDueDate() {
        return nextDueDate;
    }
    
    public void setNextDueDate(LocalDate nextDueDate) {
        this.nextDueDate = nextDueDate;
    }
    
    public Bill.BillStatus getStatus() {
        return status;
    }
    
    public void setStatus(Bill.BillStatus status) {
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
    
    public Integer getDaysUntilDue() {
        return daysUntilDue;
    }
    
    public void setDaysUntilDue(Integer daysUntilDue) {
        this.daysUntilDue = daysUntilDue;
    }
    
    public Boolean getIsOverdue() {
        return isOverdue;
    }
    
    public void setIsOverdue(Boolean isOverdue) {
        this.isOverdue = isOverdue;
    }
    
    public Boolean getIsDueToday() {
        return isDueToday;
    }
    
    public void setIsDueToday(Boolean isDueToday) {
        this.isDueToday = isDueToday;
    }
    
    public Boolean getNeedsReminder() {
        return needsReminder;
    }
    
    public void setNeedsReminder(Boolean needsReminder) {
        this.needsReminder = needsReminder;
    }
}