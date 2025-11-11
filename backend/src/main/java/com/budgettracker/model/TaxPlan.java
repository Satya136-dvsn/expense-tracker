package com.budgettracker.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "tax_plans")
public class TaxPlan {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "tax_year", nullable = false)
    private Integer taxYear;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "filing_status", nullable = false)
    private FilingStatus filingStatus;
    
    @Column(name = "annual_income", precision = 15, scale = 2)
    private BigDecimal annualIncome;
    
    @Column(name = "federal_withholding", precision = 10, scale = 2)
    private BigDecimal federalWithholding;
    
    @Column(name = "state_withholding", precision = 10, scale = 2)
    private BigDecimal stateWithholding;
    
    @Column(name = "estimated_tax_payments", precision = 10, scale = 2)
    private BigDecimal estimatedTaxPayments;
    
    // Deductions
    @Column(name = "standard_deduction", precision = 10, scale = 2)
    private BigDecimal standardDeduction;
    
    @Column(name = "itemized_deductions", precision = 10, scale = 2)
    private BigDecimal itemizedDeductions;
    
    @Column(name = "mortgage_interest", precision = 10, scale = 2)
    private BigDecimal mortgageInterest;
    
    @Column(name = "state_local_taxes", precision = 10, scale = 2)
    private BigDecimal stateLocalTaxes;
    
    @Column(name = "charitable_contributions", precision = 10, scale = 2)
    private BigDecimal charitableContributions;
    
    @Column(name = "medical_expenses", precision = 10, scale = 2)
    private BigDecimal medicalExpenses;
    
    // Tax-advantaged accounts
    @Column(name = "traditional_401k_contribution", precision = 10, scale = 2)
    private BigDecimal traditional401kContribution;
    
    @Column(name = "traditional_ira_contribution", precision = 10, scale = 2)
    private BigDecimal traditionalIraContribution;
    
    @Column(name = "roth_ira_contribution", precision = 10, scale = 2)
    private BigDecimal rothIraContribution;
    
    @Column(name = "hsa_contribution", precision = 10, scale = 2)
    private BigDecimal hsaContribution;
    
    // Investment-related
    @Column(name = "capital_gains", precision = 10, scale = 2)
    private BigDecimal capitalGains;
    
    @Column(name = "capital_losses", precision = 10, scale = 2)
    private BigDecimal capitalLosses;
    
    @Column(name = "dividend_income", precision = 10, scale = 2)
    private BigDecimal dividendIncome;
    
    @Column(name = "interest_income", precision = 10, scale = 2)
    private BigDecimal interestIncome;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors
    public TaxPlan() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.federalWithholding = BigDecimal.ZERO;
        this.stateWithholding = BigDecimal.ZERO;
        this.estimatedTaxPayments = BigDecimal.ZERO;
        this.itemizedDeductions = BigDecimal.ZERO;
        this.mortgageInterest = BigDecimal.ZERO;
        this.stateLocalTaxes = BigDecimal.ZERO;
        this.charitableContributions = BigDecimal.ZERO;
        this.medicalExpenses = BigDecimal.ZERO;
        this.traditional401kContribution = BigDecimal.ZERO;
        this.traditionalIraContribution = BigDecimal.ZERO;
        this.rothIraContribution = BigDecimal.ZERO;
        this.hsaContribution = BigDecimal.ZERO;
        this.capitalGains = BigDecimal.ZERO;
        this.capitalLosses = BigDecimal.ZERO;
        this.dividendIncome = BigDecimal.ZERO;
        this.interestIncome = BigDecimal.ZERO;
    }
    
    public TaxPlan(User user, Integer taxYear, FilingStatus filingStatus, BigDecimal annualIncome) {
        this();
        this.user = user;
        this.taxYear = taxYear;
        this.filingStatus = filingStatus;
        this.annualIncome = annualIncome;
    }
    
    // Calculated fields
    @Transient
    public BigDecimal getTotalDeductions() {
        BigDecimal itemized = itemizedDeductions != null ? itemizedDeductions : BigDecimal.ZERO;
        BigDecimal standard = standardDeduction != null ? standardDeduction : BigDecimal.ZERO;
        return itemized.compareTo(standard) > 0 ? itemized : standard;
    }
    
    @Transient
    public Boolean shouldItemize() {
        BigDecimal itemized = itemizedDeductions != null ? itemizedDeductions : BigDecimal.ZERO;
        BigDecimal standard = standardDeduction != null ? standardDeduction : BigDecimal.ZERO;
        return itemized.compareTo(standard) > 0;
    }
    
    @Transient
    public BigDecimal getTaxableIncome() {
        BigDecimal income = annualIncome != null ? annualIncome : BigDecimal.ZERO;
        BigDecimal deductions = getTotalDeductions();
        BigDecimal result = income.subtract(deductions);
        return result.compareTo(BigDecimal.ZERO) > 0 ? result : BigDecimal.ZERO;
    }
    
    @Transient
    public BigDecimal getTotalWithholding() {
        BigDecimal federal = federalWithholding != null ? federalWithholding : BigDecimal.ZERO;
        BigDecimal state = stateWithholding != null ? stateWithholding : BigDecimal.ZERO;
        BigDecimal estimated = estimatedTaxPayments != null ? estimatedTaxPayments : BigDecimal.ZERO;
        return federal.add(state).add(estimated);
    }
    
    @Transient
    public BigDecimal getNetCapitalGains() {
        BigDecimal gains = capitalGains != null ? capitalGains : BigDecimal.ZERO;
        BigDecimal losses = capitalLosses != null ? capitalLosses : BigDecimal.ZERO;
        BigDecimal net = gains.subtract(losses);
        return net.compareTo(BigDecimal.ZERO) > 0 ? net : BigDecimal.ZERO;
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
    
    public Integer getTaxYear() {
        return taxYear;
    }
    
    public void setTaxYear(Integer taxYear) {
        this.taxYear = taxYear;
    }
    
    public FilingStatus getFilingStatus() {
        return filingStatus;
    }
    
    public void setFilingStatus(FilingStatus filingStatus) {
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
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    // Enums
    public enum FilingStatus {
        SINGLE,
        MARRIED_FILING_JOINTLY,
        MARRIED_FILING_SEPARATELY,
        HEAD_OF_HOUSEHOLD,
        QUALIFYING_WIDOW
    }
}