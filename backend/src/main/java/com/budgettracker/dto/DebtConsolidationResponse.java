package com.budgettracker.dto;

import java.math.BigDecimal;
import java.util.List;

public class DebtConsolidationResponse {
    
    private BigDecimal totalCurrentDebt;
    private BigDecimal totalCurrentMinimumPayments;
    private BigDecimal totalCurrentInterestPaid;
    private Integer currentPayoffTimeMonths;
    
    private BigDecimal consolidatedLoanAmount;
    private BigDecimal consolidatedInterestRate;
    private BigDecimal consolidatedMonthlyPayment;
    private BigDecimal consolidatedTotalInterest;
    private Integer consolidatedPayoffTimeMonths;
    
    private BigDecimal monthlySavings;
    private BigDecimal totalInterestSavings;
    private Integer timeSavingsMonths;
    
    private Boolean isConsolidationBeneficial;
    private String recommendation;
    private List<String> benefits;
    private List<String> considerations;
    
    // Constructors
    public DebtConsolidationResponse() {}
    
    // Getters and Setters
    public BigDecimal getTotalCurrentDebt() {
        return totalCurrentDebt;
    }
    
    public void setTotalCurrentDebt(BigDecimal totalCurrentDebt) {
        this.totalCurrentDebt = totalCurrentDebt;
    }
    
    public BigDecimal getTotalCurrentMinimumPayments() {
        return totalCurrentMinimumPayments;
    }
    
    public void setTotalCurrentMinimumPayments(BigDecimal totalCurrentMinimumPayments) {
        this.totalCurrentMinimumPayments = totalCurrentMinimumPayments;
    }
    
    public BigDecimal getTotalCurrentInterestPaid() {
        return totalCurrentInterestPaid;
    }
    
    public void setTotalCurrentInterestPaid(BigDecimal totalCurrentInterestPaid) {
        this.totalCurrentInterestPaid = totalCurrentInterestPaid;
    }
    
    public Integer getCurrentPayoffTimeMonths() {
        return currentPayoffTimeMonths;
    }
    
    public void setCurrentPayoffTimeMonths(Integer currentPayoffTimeMonths) {
        this.currentPayoffTimeMonths = currentPayoffTimeMonths;
    }
    
    public BigDecimal getConsolidatedLoanAmount() {
        return consolidatedLoanAmount;
    }
    
    public void setConsolidatedLoanAmount(BigDecimal consolidatedLoanAmount) {
        this.consolidatedLoanAmount = consolidatedLoanAmount;
    }
    
    public BigDecimal getConsolidatedInterestRate() {
        return consolidatedInterestRate;
    }
    
    public void setConsolidatedInterestRate(BigDecimal consolidatedInterestRate) {
        this.consolidatedInterestRate = consolidatedInterestRate;
    }
    
    public BigDecimal getConsolidatedMonthlyPayment() {
        return consolidatedMonthlyPayment;
    }
    
    public void setConsolidatedMonthlyPayment(BigDecimal consolidatedMonthlyPayment) {
        this.consolidatedMonthlyPayment = consolidatedMonthlyPayment;
    }
    
    public BigDecimal getConsolidatedTotalInterest() {
        return consolidatedTotalInterest;
    }
    
    public void setConsolidatedTotalInterest(BigDecimal consolidatedTotalInterest) {
        this.consolidatedTotalInterest = consolidatedTotalInterest;
    }
    
    public Integer getConsolidatedPayoffTimeMonths() {
        return consolidatedPayoffTimeMonths;
    }
    
    public void setConsolidatedPayoffTimeMonths(Integer consolidatedPayoffTimeMonths) {
        this.consolidatedPayoffTimeMonths = consolidatedPayoffTimeMonths;
    }
    
    public BigDecimal getMonthlySavings() {
        return monthlySavings;
    }
    
    public void setMonthlySavings(BigDecimal monthlySavings) {
        this.monthlySavings = monthlySavings;
    }
    
    public BigDecimal getTotalInterestSavings() {
        return totalInterestSavings;
    }
    
    public void setTotalInterestSavings(BigDecimal totalInterestSavings) {
        this.totalInterestSavings = totalInterestSavings;
    }
    
    public Integer getTimeSavingsMonths() {
        return timeSavingsMonths;
    }
    
    public void setTimeSavingsMonths(Integer timeSavingsMonths) {
        this.timeSavingsMonths = timeSavingsMonths;
    }
    
    public Boolean getIsConsolidationBeneficial() {
        return isConsolidationBeneficial;
    }
    
    public void setIsConsolidationBeneficial(Boolean isConsolidationBeneficial) {
        this.isConsolidationBeneficial = isConsolidationBeneficial;
    }
    
    public String getRecommendation() {
        return recommendation;
    }
    
    public void setRecommendation(String recommendation) {
        this.recommendation = recommendation;
    }
    
    public List<String> getBenefits() {
        return benefits;
    }
    
    public void setBenefits(List<String> benefits) {
        this.benefits = benefits;
    }
    
    public List<String> getConsiderations() {
        return considerations;
    }
    
    public void setConsiderations(List<String> considerations) {
        this.considerations = considerations;
    }
}