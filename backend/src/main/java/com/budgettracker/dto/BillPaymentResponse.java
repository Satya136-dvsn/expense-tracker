package com.budgettracker.dto;

import com.budgettracker.model.BillPayment;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class BillPaymentResponse {
    
    private Long id;
    private Long billId;
    private String billName;
    private BigDecimal amountPaid;
    private LocalDate paymentDate;
    private LocalDate dueDate;
    private BillPayment.PaymentStatus status;
    private BillPayment.PaymentMethod paymentMethod;
    private String confirmationNumber;
    private String notes;
    private BigDecimal lateFee;
    private Boolean isAutoPay;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Additional computed fields
    private Boolean isLate;
    private Integer daysLate;
    
    // Constructors
    public BillPaymentResponse() {}
    
    public BillPaymentResponse(BillPayment payment) {
        this.id = payment.getId();
        this.billId = payment.getBillId();
        this.amountPaid = payment.getAmountPaid();
        this.paymentDate = payment.getPaymentDate();
        this.dueDate = payment.getDueDate();
        this.status = payment.getStatus();
        this.paymentMethod = payment.getPaymentMethod();
        this.confirmationNumber = payment.getConfirmationNumber();
        this.notes = payment.getNotes();
        this.lateFee = payment.getLateFee();
        this.isAutoPay = payment.getIsAutoPay();
        this.createdAt = payment.getCreatedAt();
        this.updatedAt = payment.getUpdatedAt();
        
        // Calculate computed fields
        calculateComputedFields();
    }
    
    public BillPaymentResponse(BillPayment payment, String billName) {
        this(payment);
        this.billName = billName;
    }
    
    private void calculateComputedFields() {
        if (paymentDate != null && dueDate != null) {
            this.isLate = paymentDate.isAfter(dueDate);
            this.daysLate = isLate ? (int) dueDate.until(paymentDate).getDays() : 0;
        } else {
            this.isLate = false;
            this.daysLate = 0;
        }
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getBillId() {
        return billId;
    }
    
    public void setBillId(Long billId) {
        this.billId = billId;
    }
    
    public String getBillName() {
        return billName;
    }
    
    public void setBillName(String billName) {
        this.billName = billName;
    }
    
    public BigDecimal getAmountPaid() {
        return amountPaid;
    }
    
    public void setAmountPaid(BigDecimal amountPaid) {
        this.amountPaid = amountPaid;
    }
    
    public LocalDate getPaymentDate() {
        return paymentDate;
    }
    
    public void setPaymentDate(LocalDate paymentDate) {
        this.paymentDate = paymentDate;
    }
    
    public LocalDate getDueDate() {
        return dueDate;
    }
    
    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }
    
    public BillPayment.PaymentStatus getStatus() {
        return status;
    }
    
    public void setStatus(BillPayment.PaymentStatus status) {
        this.status = status;
    }
    
    public BillPayment.PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }
    
    public void setPaymentMethod(BillPayment.PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
    
    public String getConfirmationNumber() {
        return confirmationNumber;
    }
    
    public void setConfirmationNumber(String confirmationNumber) {
        this.confirmationNumber = confirmationNumber;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public BigDecimal getLateFee() {
        return lateFee;
    }
    
    public void setLateFee(BigDecimal lateFee) {
        this.lateFee = lateFee;
    }
    
    public Boolean getIsAutoPay() {
        return isAutoPay;
    }
    
    public void setIsAutoPay(Boolean isAutoPay) {
        this.isAutoPay = isAutoPay;
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
    
    public Boolean getIsLate() {
        return isLate;
    }
    
    public void setIsLate(Boolean isLate) {
        this.isLate = isLate;
    }
    
    public Integer getDaysLate() {
        return daysLate;
    }
    
    public void setDaysLate(Integer daysLate) {
        this.daysLate = daysLate;
    }
}