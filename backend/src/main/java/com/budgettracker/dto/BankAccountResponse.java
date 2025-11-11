package com.budgettracker.dto;

import com.budgettracker.model.BankAccount;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BankAccountResponse {
    
    private Long id;
    private String accountName;
    private String bankName;
    private String maskedAccountNumber; // Only show last 4 digits
    private BankAccount.AccountType accountType;
    private BigDecimal currentBalance;
    private BigDecimal availableBalance;
    private String currencyCode;
    private BankAccount.ConnectionStatus connectionStatus;
    private LocalDateTime lastSyncAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructors
    public BankAccountResponse() {}
    
    public BankAccountResponse(BankAccount bankAccount) {
        this.id = bankAccount.getId();
        this.accountName = bankAccount.getAccountName();
        this.bankName = bankAccount.getBankName();
        this.maskedAccountNumber = maskAccountNumber(bankAccount.getAccountNumber());
        this.accountType = bankAccount.getAccountType();
        this.currentBalance = bankAccount.getCurrentBalance();
        this.availableBalance = bankAccount.getAvailableBalance();
        this.currencyCode = bankAccount.getCurrencyCode();
        this.connectionStatus = bankAccount.getConnectionStatus();
        this.lastSyncAt = bankAccount.getLastSyncAt();
        this.createdAt = bankAccount.getCreatedAt();
        this.updatedAt = bankAccount.getUpdatedAt();
    }
    
    // Static factory method
    public static BankAccountResponse fromEntity(BankAccount bankAccount) {
        return new BankAccountResponse(bankAccount);
    }
    
    // Helper method to mask account number
    private String maskAccountNumber(String accountNumber) {
        if (accountNumber == null || accountNumber.length() <= 4) {
            return "****";
        }
        return "****" + accountNumber.substring(accountNumber.length() - 4);
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getAccountName() {
        return accountName;
    }
    
    public void setAccountName(String accountName) {
        this.accountName = accountName;
    }
    
    public String getBankName() {
        return bankName;
    }
    
    public void setBankName(String bankName) {
        this.bankName = bankName;
    }
    
    public String getMaskedAccountNumber() {
        return maskedAccountNumber;
    }
    
    public void setMaskedAccountNumber(String maskedAccountNumber) {
        this.maskedAccountNumber = maskedAccountNumber;
    }
    
    public BankAccount.AccountType getAccountType() {
        return accountType;
    }
    
    public void setAccountType(BankAccount.AccountType accountType) {
        this.accountType = accountType;
    }
    
    public BigDecimal getCurrentBalance() {
        return currentBalance;
    }
    
    public void setCurrentBalance(BigDecimal currentBalance) {
        this.currentBalance = currentBalance;
    }
    
    public BigDecimal getAvailableBalance() {
        return availableBalance;
    }
    
    public void setAvailableBalance(BigDecimal availableBalance) {
        this.availableBalance = availableBalance;
    }
    
    public String getCurrencyCode() {
        return currencyCode;
    }
    
    public void setCurrencyCode(String currencyCode) {
        this.currencyCode = currencyCode;
    }
    
    public BankAccount.ConnectionStatus getConnectionStatus() {
        return connectionStatus;
    }
    
    public void setConnectionStatus(BankAccount.ConnectionStatus connectionStatus) {
        this.connectionStatus = connectionStatus;
    }
    
    public LocalDateTime getLastSyncAt() {
        return lastSyncAt;
    }
    
    public void setLastSyncAt(LocalDateTime lastSyncAt) {
        this.lastSyncAt = lastSyncAt;
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
        return "BankAccountResponse{" +
                "id=" + id +
                ", accountName='" + accountName + '\'' +
                ", bankName='" + bankName + '\'' +
                ", accountType=" + accountType +
                ", connectionStatus=" + connectionStatus +
                '}';
    }
}