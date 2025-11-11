package com.budgettracker.dto;

import com.budgettracker.model.Bill;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public class BillRequest {
    
    @NotBlank(message = "Bill name is required")
    @Size(max = 255, message = "Bill name must not exceed 255 characters")
    private String name;
    
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;
    
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    @Digits(integer = 10, fraction = 2, message = "Amount must have at most 10 integer digits and 2 decimal places")
    private BigDecimal amount;
    
    @NotBlank(message = "Category is required")
    private String category;
    
    @NotNull(message = "Frequency is required")
    private Bill.BillFrequency frequency;
    
    @NotNull(message = "Due date is required")
    private LocalDate dueDate;
    
    private Boolean autoPay = false;
    
    @Min(value = 0, message = "Reminder days must be non-negative")
    @Max(value = 30, message = "Reminder days must not exceed 30")
    private Integer reminderDaysBefore = 3;
    
    private String payee;
    
    private String accountNumber;
    
    private String websiteUrl;
    
    private String notes;
    
    // Constructors
    public BillRequest() {}
    
    public BillRequest(String name, BigDecimal amount, String category, 
                      Bill.BillFrequency frequency, LocalDate dueDate) {
        this.name = name;
        this.amount = amount;
        this.category = category;
        this.frequency = frequency;
        this.dueDate = dueDate;
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
}