package com.budgettracker.dto;

import com.budgettracker.model.BankAccount;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public class BankAccountRequest {
    
    @NotBlank(message = "Account name is required")
    @Size(max = 100, message = "Account name must not exceed 100 characters")
    private String accountName;
    
    @NotBlank(message = "Bank name is required")
    @Size(max = 100, message = "Bank name must not exceed 100 characters")
    private String bankName;
    
    @NotBlank(message = "Account number is required")
    @Size(max = 50, message = "Account number must not exceed 50 characters")
    private String accountNumber;
    
    @NotNull(message = "Account type is required")
    private BankAccount.AccountType accountType;
    
    private BigDecimal currentBalance;
    private BigDecimal availableBalance;
    
    @Size(min = 3, max = 3, message = "Currency code must be exactly 3 characters")
    private String currencyCode = "USD";
    
    private String externalAccountId;
    private String institutionId;
    
    // Constructors
    public BankAccountRequest() {}
    
    public BankAccountRequest(String accountName, String bankName, String accountNumber, BankAccount.AccountType accountType) {
        this.accountName = accountName;
        this.bankName = bankName;
        this.accountNumber = accountNumber;
        this.accountType = accountType;
    }
    
    // Getters and Setters
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
    
    public String getAccountNumber() {
        return accountNumber;
    }
    
    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
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
    
    public String getExternalAccountId() {
        return externalAccountId;
    }
    
    public void setExternalAccountId(String externalAccountId) {
        this.externalAccountId = externalAccountId;
    }
    
    public String getInstitutionId() {
        return institutionId;
    }
    
    public void setInstitutionId(String institutionId) {
        this.institutionId = institutionId;
    }
    
    @Override
    public String toString() {
        return "BankAccountRequest{" +
                "accountName='" + accountName + '\'' +
                ", bankName='" + bankName + '\'' +
                ", accountType=" + accountType +
                ", currencyCode='" + currencyCode + '\'' +
                '}';
    }
}