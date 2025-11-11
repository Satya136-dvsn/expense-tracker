package com.budgettracker.dto;

import com.budgettracker.model.BillPayment;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public class BillPaymentRequest {
    
    @NotNull(message = "Bill ID is required")
    private Long billId;
    
    @NotNull(message = "Amount paid is required")
    @DecimalMin(value = "0.01", message = "Amount paid must be greater than 0")
    @Digits(integer = 10, fraction = 2, message = "Amount paid must have at most 10 integer digits and 2 decimal places")
    private BigDecimal amountPaid;
    
    @NotNull(message = "Payment date is required")
    private LocalDate paymentDate;
    
    @NotNull(message = "Due date is required")
    private LocalDate dueDate;
    
    @NotNull(message = "Payment status is required")
    private BillPayment.PaymentStatus status;
    
    private BillPayment.PaymentMethod paymentMethod;
    
    private String confirmationNumber;
    
    private String notes;
    
    @DecimalMin(value = "0.00", message = "Late fee must be non-negative")
    @Digits(integer = 8, fraction = 2, message = "Late fee must have at most 8 integer digits and 2 decimal places")
    private BigDecimal lateFee = BigDecimal.ZERO;
    
    private Boolean isAutoPay = false;
    
    // Constructors
    public BillPaymentRequest() {}
    
    public BillPaymentRequest(Long billId, BigDecimal amountPaid, LocalDate paymentDate, 
                             LocalDate dueDate, BillPayment.PaymentStatus status) {
        this.billId = billId;
        this.amountPaid = amountPaid;
        this.paymentDate = paymentDate;
        this.dueDate = dueDate;
        this.status = status;
    }
    
    // Getters and Setters
    public Long getBillId() {
        return billId;
    }
    
    public void setBillId(Long billId) {
        this.billId = billId;
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
}