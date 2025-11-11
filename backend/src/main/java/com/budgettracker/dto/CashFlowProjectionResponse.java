package com.budgettracker.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class CashFlowProjectionResponse {
    
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal startingBalance;
    private BigDecimal projectedEndingBalance;
    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal totalBillPayments;
    private BigDecimal netCashFlow;
    private List<CashFlowItem> cashFlowItems;
    private List<BillProjection> upcomingBills;
    
    // Constructors
    public CashFlowProjectionResponse() {}
    
    public CashFlowProjectionResponse(LocalDate startDate, LocalDate endDate, 
                                    BigDecimal startingBalance) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.startingBalance = startingBalance;
    }
    
    // Getters and Setters
    public LocalDate getStartDate() {
        return startDate;
    }
    
    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }
    
    public LocalDate getEndDate() {
        return endDate;
    }
    
    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }
    
    public BigDecimal getStartingBalance() {
        return startingBalance;
    }
    
    public void setStartingBalance(BigDecimal startingBalance) {
        this.startingBalance = startingBalance;
    }
    
    public BigDecimal getProjectedEndingBalance() {
        return projectedEndingBalance;
    }
    
    public void setProjectedEndingBalance(BigDecimal projectedEndingBalance) {
        this.projectedEndingBalance = projectedEndingBalance;
    }
    
    public BigDecimal getTotalIncome() {
        return totalIncome;
    }
    
    public void setTotalIncome(BigDecimal totalIncome) {
        this.totalIncome = totalIncome;
    }
    
    public BigDecimal getTotalExpenses() {
        return totalExpenses;
    }
    
    public void setTotalExpenses(BigDecimal totalExpenses) {
        this.totalExpenses = totalExpenses;
    }
    
    public BigDecimal getTotalBillPayments() {
        return totalBillPayments;
    }
    
    public void setTotalBillPayments(BigDecimal totalBillPayments) {
        this.totalBillPayments = totalBillPayments;
    }
    
    public BigDecimal getNetCashFlow() {
        return netCashFlow;
    }
    
    public void setNetCashFlow(BigDecimal netCashFlow) {
        this.netCashFlow = netCashFlow;
    }
    
    public List<CashFlowItem> getCashFlowItems() {
        return cashFlowItems;
    }
    
    public void setCashFlowItems(List<CashFlowItem> cashFlowItems) {
        this.cashFlowItems = cashFlowItems;
    }
    
    public List<BillProjection> getUpcomingBills() {
        return upcomingBills;
    }
    
    public void setUpcomingBills(List<BillProjection> upcomingBills) {
        this.upcomingBills = upcomingBills;
    }
    
    // Inner classes
    public static class CashFlowItem {
        private LocalDate date;
        private String description;
        private String type; // INCOME, EXPENSE, BILL
        private BigDecimal amount;
        private BigDecimal runningBalance;
        
        public CashFlowItem() {}
        
        public CashFlowItem(LocalDate date, String description, String type, 
                           BigDecimal amount, BigDecimal runningBalance) {
            this.date = date;
            this.description = description;
            this.type = type;
            this.amount = amount;
            this.runningBalance = runningBalance;
        }
        
        // Getters and Setters
        public LocalDate getDate() {
            return date;
        }
        
        public void setDate(LocalDate date) {
            this.date = date;
        }
        
        public String getDescription() {
            return description;
        }
        
        public void setDescription(String description) {
            this.description = description;
        }
        
        public String getType() {
            return type;
        }
        
        public void setType(String type) {
            this.type = type;
        }
        
        public BigDecimal getAmount() {
            return amount;
        }
        
        public void setAmount(BigDecimal amount) {
            this.amount = amount;
        }
        
        public BigDecimal getRunningBalance() {
            return runningBalance;
        }
        
        public void setRunningBalance(BigDecimal runningBalance) {
            this.runningBalance = runningBalance;
        }
    }
    
    public static class BillProjection {
        private Long billId;
        private String billName;
        private LocalDate dueDate;
        private BigDecimal amount;
        private String category;
        private Boolean isOverdue;
        private Integer daysUntilDue;
        
        public BillProjection() {}
        
        public BillProjection(Long billId, String billName, LocalDate dueDate, 
                             BigDecimal amount, String category) {
            this.billId = billId;
            this.billName = billName;
            this.dueDate = dueDate;
            this.amount = amount;
            this.category = category;
            
            // Calculate computed fields
            LocalDate today = LocalDate.now();
            this.isOverdue = dueDate.isBefore(today);
            this.daysUntilDue = (int) today.until(dueDate).getDays();
        }
        
        // Getters and Setters
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
        
        public LocalDate getDueDate() {
            return dueDate;
        }
        
        public void setDueDate(LocalDate dueDate) {
            this.dueDate = dueDate;
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
        
        public Boolean getIsOverdue() {
            return isOverdue;
        }
        
        public void setIsOverdue(Boolean isOverdue) {
            this.isOverdue = isOverdue;
        }
        
        public Integer getDaysUntilDue() {
            return daysUntilDue;
        }
        
        public void setDaysUntilDue(Integer daysUntilDue) {
            this.daysUntilDue = daysUntilDue;
        }
    }
}