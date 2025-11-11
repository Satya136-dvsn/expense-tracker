package com.budgettracker.service;

import com.budgettracker.dto.*;
import com.budgettracker.model.Bill;
import com.budgettracker.model.BillPayment;
import com.budgettracker.model.Transaction;
import com.budgettracker.repository.BillRepository;
import com.budgettracker.repository.BillPaymentRepository;
import com.budgettracker.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class BillReminderService {
    
    @Autowired
    private BillRepository billRepository;
    
    @Autowired
    private BillPaymentRepository billPaymentRepository;
    
    @Autowired
    private TransactionRepository transactionRepository;
    
    /**
     * Create a new bill
     */
    public BillResponse createBill(Long userId, BillRequest request) {
        Bill bill = new Bill(userId, request.getName(), request.getAmount(), 
                           request.getCategory(), request.getFrequency(), request.getDueDate());
        
        bill.setDescription(request.getDescription());
        bill.setAutoPay(request.getAutoPay());
        bill.setReminderDaysBefore(request.getReminderDaysBefore());
        bill.setPayee(request.getPayee());
        bill.setAccountNumber(request.getAccountNumber());
        bill.setWebsiteUrl(request.getWebsiteUrl());
        bill.setNotes(request.getNotes());
        
        Bill savedBill = billRepository.save(bill);
        return new BillResponse(savedBill);
    }
    
    /**
     * Update an existing bill
     */
    public BillResponse updateBill(Long userId, Long billId, BillRequest request) {
        Bill bill = billRepository.findById(billId)
            .orElseThrow(() -> new RuntimeException("Bill not found"));
        
        if (!bill.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to bill");
        }
        
        bill.setName(request.getName());
        bill.setDescription(request.getDescription());
        bill.setAmount(request.getAmount());
        bill.setCategory(request.getCategory());
        bill.setFrequency(request.getFrequency());
        bill.setDueDate(request.getDueDate());
        bill.setAutoPay(request.getAutoPay());
        bill.setReminderDaysBefore(request.getReminderDaysBefore());
        bill.setPayee(request.getPayee());
        bill.setAccountNumber(request.getAccountNumber());
        bill.setWebsiteUrl(request.getWebsiteUrl());
        bill.setNotes(request.getNotes());
        
        Bill savedBill = billRepository.save(bill);
        return new BillResponse(savedBill);
    }
    
    /**
     * Get all bills for a user
     */
    public List<BillResponse> getUserBills(Long userId) {
        List<Bill> bills = billRepository.findByUserIdOrderByNextDueDateAsc(userId);
        return bills.stream()
                   .map(BillResponse::new)
                   .collect(Collectors.toList());
    }
    
    /**
     * Get bills by status
     */
    public List<BillResponse> getBillsByStatus(Long userId, Bill.BillStatus status) {
        List<Bill> bills = billRepository.findByUserIdAndStatusOrderByNextDueDateAsc(userId, status);
        return bills.stream()
                   .map(BillResponse::new)
                   .collect(Collectors.toList());
    }
    
    /**
     * Get bills due within a date range
     */
    public List<BillResponse> getBillsDueInRange(Long userId, LocalDate startDate, LocalDate endDate) {
        List<Bill> bills = billRepository.findBillsDueInDateRange(userId, startDate, endDate);
        return bills.stream()
                   .map(BillResponse::new)
                   .collect(Collectors.toList());
    }
    
    /**
     * Get overdue bills
     */
    public List<BillResponse> getOverdueBills(Long userId) {
        List<Bill> bills = billRepository.findOverdueBills(userId, LocalDate.now());
        return bills.stream()
                   .map(BillResponse::new)
                   .collect(Collectors.toList());
    }
    
    /**
     * Get bills due today
     */
    public List<BillResponse> getBillsDueToday(Long userId) {
        List<Bill> bills = billRepository.findBillsDueToday(userId, LocalDate.now());
        return bills.stream()
                   .map(BillResponse::new)
                   .collect(Collectors.toList());
    }
    
    /**
     * Get bills due within the next N days
     */
    public List<BillResponse> getBillsDueWithinDays(Long userId, int days) {
        LocalDate today = LocalDate.now();
        LocalDate futureDate = today.plusDays(days);
        List<Bill> bills = billRepository.findBillsDueWithinDays(userId, today, futureDate);
        return bills.stream()
                   .map(BillResponse::new)
                   .collect(Collectors.toList());
    }
    
    /**
     * Get bills that need reminders
     */
    public List<BillResponse> getBillsNeedingReminders(Long userId) {
        LocalDate today = LocalDate.now();
        LocalDate maxReminderDate = today.plusDays(30); // Look ahead 30 days max
        List<Bill> bills = billRepository.findBillsNeedingReminders(userId, today, maxReminderDate);
        
        // Filter bills that actually need reminders based on their individual reminder settings
        return bills.stream()
                   .filter(bill -> {
                       if (bill.getReminderDaysBefore() == null || bill.getNextDueDate() == null) {
                           return false;
                       }
                       long daysUntilDue = ChronoUnit.DAYS.between(today, bill.getNextDueDate());
                       return daysUntilDue <= bill.getReminderDaysBefore() && daysUntilDue >= 0;
                   })
                   .map(BillResponse::new)
                   .collect(Collectors.toList());
    }
    
    /**
     * Delete a bill
     */
    public void deleteBill(Long userId, Long billId) {
        Bill bill = billRepository.findById(billId)
            .orElseThrow(() -> new RuntimeException("Bill not found"));
        
        if (!bill.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to bill");
        }
        
        billRepository.delete(bill);
    }
    
    /**
     * Mark bill as paid and create payment record
     */
    public BillPaymentResponse markBillAsPaid(Long userId, Long billId, BillPaymentRequest request) {
        Bill bill = billRepository.findById(billId)
            .orElseThrow(() -> new RuntimeException("Bill not found"));
        
        if (!bill.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to bill");
        }
        
        // Create payment record
        BillPayment payment = new BillPayment(billId, userId, request.getAmountPaid(),
                                            request.getPaymentDate(), request.getDueDate(),
                                            request.getStatus());
        
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setConfirmationNumber(request.getConfirmationNumber());
        payment.setNotes(request.getNotes());
        payment.setLateFee(request.getLateFee());
        payment.setIsAutoPay(request.getIsAutoPay());
        
        BillPayment savedPayment = billPaymentRepository.save(payment);
        
        // Update bill's next due date if payment is successful
        if (request.getStatus() == BillPayment.PaymentStatus.PAID) {
            updateBillNextDueDate(bill);
            billRepository.save(bill);
        }
        
        return new BillPaymentResponse(savedPayment, bill.getName());
    }
    
    /**
     * Get payment history for a bill
     */
    public List<BillPaymentResponse> getBillPaymentHistory(Long userId, Long billId) {
        Bill bill = billRepository.findById(billId)
            .orElseThrow(() -> new RuntimeException("Bill not found"));
        
        if (!bill.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to bill");
        }
        
        List<BillPayment> payments = billPaymentRepository.findByBillIdOrderByPaymentDateDesc(billId);
        return payments.stream()
                      .map(payment -> new BillPaymentResponse(payment, bill.getName()))
                      .collect(Collectors.toList());
    }
    
    /**
     * Get all payment history for a user
     */
    public List<BillPaymentResponse> getUserPaymentHistory(Long userId) {
        List<BillPayment> payments = billPaymentRepository.findByUserIdOrderByPaymentDateDesc(userId);
        Map<Long, String> billNames = getBillNamesMap(userId);
        
        return payments.stream()
                      .map(payment -> new BillPaymentResponse(payment, billNames.get(payment.getBillId())))
                      .collect(Collectors.toList());
    }
    
    /**
     * Calculate cash flow projection including bills
     */
    public CashFlowProjectionResponse calculateCashFlowProjection(Long userId, LocalDate startDate, LocalDate endDate) {
        // Get starting balance (simplified - could be from account balance)
        BigDecimal startingBalance = BigDecimal.valueOf(1000.00); // Placeholder
        
        CashFlowProjectionResponse projection = new CashFlowProjectionResponse(startDate, endDate, startingBalance);
        
        // Get upcoming bills in the date range
        List<Bill> upcomingBills = billRepository.findBillsDueInDateRange(userId, startDate, endDate);
        
        // Get historical transactions for income/expense patterns
        List<Transaction> recentTransactions = transactionRepository.findByUserIdAndDateBetween(userId, 
                                                                                               startDate.minusMonths(3), 
                                                                                               startDate);
        
        // Calculate projected income and expenses based on historical data
        BigDecimal avgMonthlyIncome = calculateAverageMonthlyIncome(recentTransactions);
        BigDecimal avgMonthlyExpenses = calculateAverageMonthlyExpenses(recentTransactions);
        
        // Calculate bill projections
        BigDecimal totalBillPayments = upcomingBills.stream()
            .map(Bill::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Calculate projections
        long monthsInRange = ChronoUnit.MONTHS.between(startDate, endDate);
        if (monthsInRange == 0) monthsInRange = 1;
        
        BigDecimal totalIncome = avgMonthlyIncome.multiply(BigDecimal.valueOf(monthsInRange));
        BigDecimal totalExpenses = avgMonthlyExpenses.multiply(BigDecimal.valueOf(monthsInRange));
        BigDecimal netCashFlow = totalIncome.subtract(totalExpenses).subtract(totalBillPayments);
        BigDecimal projectedEndingBalance = startingBalance.add(netCashFlow);
        
        projection.setTotalIncome(totalIncome);
        projection.setTotalExpenses(totalExpenses);
        projection.setTotalBillPayments(totalBillPayments);
        projection.setNetCashFlow(netCashFlow);
        projection.setProjectedEndingBalance(projectedEndingBalance);
        
        // Create bill projections
        List<CashFlowProjectionResponse.BillProjection> billProjections = upcomingBills.stream()
            .map(bill -> new CashFlowProjectionResponse.BillProjection(
                bill.getId(), bill.getName(), bill.getNextDueDate(), 
                bill.getAmount(), bill.getCategory()))
            .collect(Collectors.toList());
        
        projection.setUpcomingBills(billProjections);
        
        // Create cash flow items (simplified)
        List<CashFlowProjectionResponse.CashFlowItem> cashFlowItems = new ArrayList<>();
        BigDecimal runningBalance = startingBalance;
        
        for (CashFlowProjectionResponse.BillProjection billProj : billProjections) {
            runningBalance = runningBalance.subtract(billProj.getAmount());
            cashFlowItems.add(new CashFlowProjectionResponse.CashFlowItem(
                billProj.getDueDate(), billProj.getBillName(), "BILL", 
                billProj.getAmount().negate(), runningBalance));
        }
        
        projection.setCashFlowItems(cashFlowItems);
        
        return projection;
    }
    
    /**
     * Get monthly bill total for a user
     */
    public BigDecimal getMonthlyBillTotal(Long userId) {
        Double total = billRepository.calculateMonthlyBillTotal(userId);
        return total != null ? BigDecimal.valueOf(total) : BigDecimal.ZERO;
    }
    
    /**
     * Update bill's next due date based on frequency
     */
    private void updateBillNextDueDate(Bill bill) {
        LocalDate currentNextDue = bill.getNextDueDate();
        if (currentNextDue == null) return;
        
        LocalDate newNextDue;
        switch (bill.getFrequency()) {
            case WEEKLY:
                newNextDue = currentNextDue.plusWeeks(1);
                break;
            case BI_WEEKLY:
                newNextDue = currentNextDue.plusWeeks(2);
                break;
            case MONTHLY:
                newNextDue = currentNextDue.plusMonths(1);
                break;
            case QUARTERLY:
                newNextDue = currentNextDue.plusMonths(3);
                break;
            case SEMI_ANNUALLY:
                newNextDue = currentNextDue.plusMonths(6);
                break;
            case ANNUALLY:
                newNextDue = currentNextDue.plusYears(1);
                break;
            case ONE_TIME:
                bill.setStatus(Bill.BillStatus.PAID_OFF);
                return;
            default:
                return;
        }
        
        bill.setNextDueDate(newNextDue);
    }
    
    /**
     * Get bill names map for payment history
     */
    private Map<Long, String> getBillNamesMap(Long userId) {
        List<Bill> bills = billRepository.findByUserIdOrderByNextDueDateAsc(userId);
        return bills.stream()
                   .collect(Collectors.toMap(Bill::getId, Bill::getName));
    }
    
    /**
     * Calculate average monthly income from transactions
     */
    private BigDecimal calculateAverageMonthlyIncome(List<Transaction> transactions) {
        BigDecimal totalIncome = transactions.stream()
            .filter(t -> t.getAmount().compareTo(BigDecimal.ZERO) > 0)
            .map(Transaction::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return totalIncome.divide(BigDecimal.valueOf(3), 2, BigDecimal.ROUND_HALF_UP);
    }
    
    /**
     * Calculate average monthly expenses from transactions
     */
    private BigDecimal calculateAverageMonthlyExpenses(List<Transaction> transactions) {
        BigDecimal totalExpenses = transactions.stream()
            .filter(t -> t.getAmount().compareTo(BigDecimal.ZERO) < 0)
            .map(transaction -> transaction.getAmount().abs())
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return totalExpenses.divide(BigDecimal.valueOf(3), 2, BigDecimal.ROUND_HALF_UP);
    }
}