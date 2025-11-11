package com.budgettracker.dto;

import com.budgettracker.model.TaxPlan;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public class TaxPlanRequest {
    
    @NotNull(message = "Tax year is required")
    @Min(value = 2020, message = "Tax year must be 2020 or later")
    @Max(value = 2030, message = "Tax year must be 2030 or earlier")
    private Integer taxYear;
    
    @NotNull(message = "Filing status is required")
    private TaxPlan.FilingStatus filingStatus;
    
    @NotNull(message = "Annual income is required")
    @DecimalMin(value = "0.00", message = "Annual income must be greater than or equal to 0")
    @Digits(integer = 15, fraction = 2, message = "Annual income must have at most 15 integer digits and 2 decimal places")
    private BigDecimal annualIncome;
    
    @DecimalMin(value = "0.00", message = "Federal withholding must be greater than or equal to 0")
    @Digits(integer = 10, fraction = 2, message = "Federal withholding must have at most 10 integer digits and 2 decimal places")
    private BigDecimal federalWithholding;
    
    @DecimalMin(value = "0.00", message = "State withholding must be greater than or equal to 0")
    @Digits(integer = 10, fraction = 2, message = "State withholding must have at most 10 integer digits and 2 decimal places")
    private BigDecimal stateWithholding;
    
    @DecimalMin(value = "0.00", message = "Estimated tax payments must be greater than or equal to 0")
    @Digits(integer = 10, fraction = 2, message = "Estimated tax payments must have at most 10 integer digits and 2 decimal places")
    private BigDecimal estimatedTaxPayments;
    
    // Deductions
    @DecimalMin(value = "0.00", message = "Standard deduction must be greater than or equal to 0")
    @Digits(integer = 10, fraction = 2, message = "Standard deduction must have at most 10 integer digits and 2 decimal places")
    private BigDecimal standardDeduction;
    
    @DecimalMin(value = "0.00", message = "Itemized deductions must be greater than or equal to 0")
    @Digits(integer = 10, fraction = 2, message = "Itemized deductions must have at most 10 integer digits and 2 decimal places")
    private BigDecimal itemizedDeductions;
    
    @DecimalMin(value = "0.00", message = "Mortgage interest must be greater than or equal to 0")
    @Digits(integer = 10, fraction = 2, message = "Mortgage interest must have at most 10 integer digits and 2 decimal places")
    private BigDecimal mortgageInterest;
    
    @DecimalMin(value = "0.00", message = "State and local taxes must be greater than or equal to 0")
    @Digits(integer = 10, fraction = 2, message = "State and local taxes must have at most 10 integer digits and 2 decimal places")
    private BigDecimal stateLocalTaxes;
    
    @DecimalMin(value = "0.00", message = "Charitable contributions must be greater than or equal to 0")
    @Digits(integer = 10, fraction = 2, message = "Charitable contributions must have at most 10 integer digits and 2 decimal places")
    private BigDecimal charitableContributions;
    
    @DecimalMin(value = "0.00", message = "Medical expenses must be greater than or equal to 0")
    @Digits(integer = 10, fraction = 2, message = "Medical expenses must have at most 10 integer digits and 2 decimal places")
    private BigDecimal medicalExpenses;
    
    // Tax-advantaged accounts
    @DecimalMin(value = "0.00", message = "Traditional 401k contribution must be greater than or equal to 0")
    @Digits(integer = 10, fraction = 2, message = "Traditional 401k contribution must have at most 10 integer digits and 2 decimal places")
    private BigDecimal traditional401kContribution;
    
    @DecimalMin(value = "0.00", message = "Traditional IRA contribution must be greater than or equal to 0")
    @Digits(integer = 10, fraction = 2, message = "Traditional IRA contribution must have at most 10 integer digits and 2 decimal places")
    private BigDecimal traditionalIraContribution;
    
    @DecimalMin(value = "0.00", message = "Roth IRA contribution must be greater than or equal to 0")
    @Digits(integer = 10, fraction = 2, message = "Roth IRA contribution must have at most 10 integer digits and 2 decimal places")
    private BigDecimal rothIraContribution;
    
    @DecimalMin(value = "0.00", message = "HSA contribution must be greater than or equal to 0")
    @Digits(integer = 10, fraction = 2, message = "HSA contribution must have at most 10 integer digits and 2 decimal places")
    private BigDecimal hsaContribution;
    
    // Investment-related
    @DecimalMin(value = "0.00", message = "Capital gains must be greater than or equal to 0")
    @Digits(integer = 10, fraction = 2, message = "Capital gains must have at most 10 integer digits and 2 decimal places")
    private BigDecimal capitalGains;
    
    @DecimalMin(value = "0.00", message = "Capital losses must be greater than or equal to 0")
    @Digits(integer = 10, fraction = 2, message = "Capital losses must have at most 10 integer digits and 2 decimal places")
    private BigDecimal capitalLosses;
    
    @DecimalMin(value = "0.00", message = "Dividend income must be greater than or equal to 0")
    @Digits(integer = 10, fraction = 2, message = "Dividend income must have at most 10 integer digits and 2 decimal places")
    private BigDecimal dividendIncome;
    
    @DecimalMin(value = "0.00", message = "Interest income must be greater than or equal to 0")
    @Digits(integer = 10, fraction = 2, message = "Interest income must have at most 10 integer digits and 2 decimal places")
    private BigDecimal interestIncome;
    
    // Constructors
    public TaxPlanRequest() {}
    
    // Getters and Setters
    public Integer getTaxYear() {
        return taxYear;
    }
    
    public void setTaxYear(Integer taxYear) {
        this.taxYear = taxYear;
    }
    
    public TaxPlan.FilingStatus getFilingStatus() {
        return filingStatus;
    }
    
    public void setFilingStatus(TaxPlan.FilingStatus filingStatus) {
        this.filingStatus = filingStatus;
    }
    
    public BigDecimal getAnnualIncome() {
        return annualIncome;
    }
    
    public void setAnnualIncome(BigDecimal annualIncome) {
        this.annualIncome = annualIncome;
    }
    
    public BigDecimal getFederalWithholding() {
        return federalWithholding;
    }
    
    public void setFederalWithholding(BigDecimal federalWithholding) {
        this.federalWithholding = federalWithholding;
    }
    
    public BigDecimal getStateWithholding() {
        return stateWithholding;
    }
    
    public void setStateWithholding(BigDecimal stateWithholding) {
        this.stateWithholding = stateWithholding;
    }
    
    public BigDecimal getEstimatedTaxPayments() {
        return estimatedTaxPayments;
    }
    
    public void setEstimatedTaxPayments(BigDecimal estimatedTaxPayments) {
        this.estimatedTaxPayments = estimatedTaxPayments;
    }
    
    public BigDecimal getStandardDeduction() {
        return standardDeduction;
    }
    
    public void setStandardDeduction(BigDecimal standardDeduction) {
        this.standardDeduction = standardDeduction;
    }
    
    public BigDecimal getItemizedDeductions() {
        return itemizedDeductions;
    }
    
    public void setItemizedDeductions(BigDecimal itemizedDeductions) {
        this.itemizedDeductions = itemizedDeductions;
    }
    
    public BigDecimal getMortgageInterest() {
        return mortgageInterest;
    }
    
    public void setMortgageInterest(BigDecimal mortgageInterest) {
        this.mortgageInterest = mortgageInterest;
    }
    
    public BigDecimal getStateLocalTaxes() {
        return stateLocalTaxes;
    }
    
    public void setStateLocalTaxes(BigDecimal stateLocalTaxes) {
        this.stateLocalTaxes = stateLocalTaxes;
    }
    
    public BigDecimal getCharitableContributions() {
        return charitableContributions;
    }
    
    public void setCharitableContributions(BigDecimal charitableContributions) {
        this.charitableContributions = charitableContributions;
    }
    
    public BigDecimal getMedicalExpenses() {
        return medicalExpenses;
    }
    
    public void setMedicalExpenses(BigDecimal medicalExpenses) {
        this.medicalExpenses = medicalExpenses;
    }
    
    public BigDecimal getTraditional401kContribution() {
        return traditional401kContribution;
    }
    
    public void setTraditional401kContribution(BigDecimal traditional401kContribution) {
        this.traditional401kContribution = traditional401kContribution;
    }
    
    public BigDecimal getTraditionalIraContribution() {
        return traditionalIraContribution;
    }
    
    public void setTraditionalIraContribution(BigDecimal traditionalIraContribution) {
        this.traditionalIraContribution = traditionalIraContribution;
    }
    
    public BigDecimal getRothIraContribution() {
        return rothIraContribution;
    }
    
    public void setRothIraContribution(BigDecimal rothIraContribution) {
        this.rothIraContribution = rothIraContribution;
    }
    
    public BigDecimal getHsaContribution() {
        return hsaContribution;
    }
    
    public void setHsaContribution(BigDecimal hsaContribution) {
        this.hsaContribution = hsaContribution;
    }
    
    public BigDecimal getCapitalGains() {
        return capitalGains;
    }
    
    public void setCapitalGains(BigDecimal capitalGains) {
        this.capitalGains = capitalGains;
    }
    
    public BigDecimal getCapitalLosses() {
        return capitalLosses;
    }
    
    public void setCapitalLosses(BigDecimal capitalLosses) {
        this.capitalLosses = capitalLosses;
    }
    
    public BigDecimal getDividendIncome() {
        return dividendIncome;
    }
    
    public void setDividendIncome(BigDecimal dividendIncome) {
        this.dividendIncome = dividendIncome;
    }
    
    public BigDecimal getInterestIncome() {
        return interestIncome;
    }
    
    public void setInterestIncome(BigDecimal interestIncome) {
        this.interestIncome = interestIncome;
    }
}