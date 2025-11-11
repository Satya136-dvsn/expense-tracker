package com.budgettracker.service;

import com.budgettracker.dto.*;
import com.budgettracker.model.Bill;
import com.budgettracker.model.BillPayment;
import com.budgettracker.model.Transaction;
import com.budgettracker.repository.BillRepository;
import com.budgettracker.repository.BillPaymentRepository;
import com.budgettracker.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BillReminderServiceTest {

    @Mock
    private BillRepository billRepository;

    @Mock
    private BillPaymentRepository billPaymentRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private BillReminderService billReminderService;

    private Bill testBill;
    private BillRequest testBillRequest;
    private BillPayment testPayment;
    private BillPaymentRequest testPaymentRequest;

    @BeforeEach
    void setUp() {
        testBill = new Bill();
        testBill.setId(1L);
        testBill.setUserId(1L);
        testBill.setName("Electric Bill");
        testBill.setAmount(new BigDecimal("150.00"));
        testBill.setCategory("Utilities");
        testBill.setFrequency(Bill.BillFrequency.MONTHLY);
        testBill.setDueDate(LocalDate.now().plusDays(15));
        testBill.setNextDueDate(LocalDate.now().plusDays(15));
        testBill.setStatus(Bill.BillStatus.ACTIVE);
        testBill.setReminderDaysBefore(3);

        testBillRequest = new BillRequest();
        testBillRequest.setName("Electric Bill");
        testBillRequest.setAmount(new BigDecimal("150.00"));
        testBillRequest.setCategory("Utilities");
        testBillRequest.setFrequency(Bill.BillFrequency.MONTHLY);
        testBillRequest.setDueDate(LocalDate.now().plusDays(15));
        testBillRequest.setReminderDaysBefore(3);

        testPayment = new BillPayment();
        testPayment.setId(1L);
        testPayment.setBillId(1L);
        testPayment.setUserId(1L);
        testPayment.setAmountPaid(new BigDecimal("150.00"));
        testPayment.setPaymentDate(LocalDate.now());
        testPayment.setDueDate(LocalDate.now());
        testPayment.setStatus(BillPayment.PaymentStatus.PAID);

        testPaymentRequest = new BillPaymentRequest();
        testPaymentRequest.setBillId(1L);
        testPaymentRequest.setAmountPaid(new BigDecimal("150.00"));
        testPaymentRequest.setPaymentDate(LocalDate.now());
        testPaymentRequest.setDueDate(LocalDate.now());
        testPaymentRequest.setStatus(BillPayment.PaymentStatus.PAID);
    }

    @Test
    void createBill_ShouldCreateAndReturnBill() {
        // Arrange
        when(billRepository.save(any(Bill.class))).thenReturn(testBill);

        // Act
        BillResponse result = billReminderService.createBill(1L, testBillRequest);

        // Assert
        assertNotNull(result);
        assertEquals("Electric Bill", result.getName());
        assertEquals(new BigDecimal("150.00"), result.getAmount());
        assertEquals("Utilities", result.getCategory());
        assertEquals(Bill.BillFrequency.MONTHLY, result.getFrequency());
        verify(billRepository).save(any(Bill.class));
    }

    @Test
    void updateBill_ShouldUpdateExistingBill() {
        // Arrange
        when(billRepository.findById(1L)).thenReturn(Optional.of(testBill));
        when(billRepository.save(any(Bill.class))).thenReturn(testBill);

        testBillRequest.setName("Updated Electric Bill");
        testBillRequest.setAmount(new BigDecimal("175.00"));

        // Act
        BillResponse result = billReminderService.updateBill(1L, 1L, testBillRequest);

        // Assert
        assertNotNull(result);
        verify(billRepository).findById(1L);
        verify(billRepository).save(any(Bill.class));
    }

    @Test
    void updateBill_ShouldThrowExceptionWhenBillNotFound() {
        // Arrange
        when(billRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> 
            billReminderService.updateBill(1L, 1L, testBillRequest));
        verify(billRepository).findById(1L);
        verify(billRepository, never()).save(any(Bill.class));
    }

    @Test
    void updateBill_ShouldThrowExceptionWhenUnauthorized() {
        // Arrange
        testBill.setUserId(2L); // Different user
        when(billRepository.findById(1L)).thenReturn(Optional.of(testBill));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> 
            billReminderService.updateBill(1L, 1L, testBillRequest));
        verify(billRepository).findById(1L);
        verify(billRepository, never()).save(any(Bill.class));
    }

    @Test
    void getUserBills_ShouldReturnUserBills() {
        // Arrange
        List<Bill> bills = Arrays.asList(testBill);
        when(billRepository.findByUserIdOrderByNextDueDateAsc(1L)).thenReturn(bills);

        // Act
        List<BillResponse> result = billReminderService.getUserBills(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Electric Bill", result.get(0).getName());
        verify(billRepository).findByUserIdOrderByNextDueDateAsc(1L);
    }

    @Test
    void getBillsByStatus_ShouldReturnBillsWithSpecificStatus() {
        // Arrange
        List<Bill> bills = Arrays.asList(testBill);
        when(billRepository.findByUserIdAndStatusOrderByNextDueDateAsc(1L, Bill.BillStatus.ACTIVE))
            .thenReturn(bills);

        // Act
        List<BillResponse> result = billReminderService.getBillsByStatus(1L, Bill.BillStatus.ACTIVE);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(Bill.BillStatus.ACTIVE, result.get(0).getStatus());
        verify(billRepository).findByUserIdAndStatusOrderByNextDueDateAsc(1L, Bill.BillStatus.ACTIVE);
    }

    @Test
    void getBillsDueInRange_ShouldReturnBillsInDateRange() {
        // Arrange
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = LocalDate.now().plusDays(30);
        List<Bill> bills = Arrays.asList(testBill);
        when(billRepository.findBillsDueInDateRange(1L, startDate, endDate)).thenReturn(bills);

        // Act
        List<BillResponse> result = billReminderService.getBillsDueInRange(1L, startDate, endDate);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(billRepository).findBillsDueInDateRange(1L, startDate, endDate);
    }

    @Test
    void getOverdueBills_ShouldReturnOverdueBills() {
        // Arrange
        testBill.setNextDueDate(LocalDate.now().minusDays(5));
        List<Bill> bills = Arrays.asList(testBill);
        when(billRepository.findOverdueBills(eq(1L), any(LocalDate.class))).thenReturn(bills);

        // Act
        List<BillResponse> result = billReminderService.getOverdueBills(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertTrue(result.get(0).getIsOverdue());
        verify(billRepository).findOverdueBills(eq(1L), any(LocalDate.class));
    }

    @Test
    void getBillsDueToday_ShouldReturnBillsDueToday() {
        // Arrange
        testBill.setNextDueDate(LocalDate.now());
        List<Bill> bills = Arrays.asList(testBill);
        when(billRepository.findBillsDueToday(eq(1L), any(LocalDate.class))).thenReturn(bills);

        // Act
        List<BillResponse> result = billReminderService.getBillsDueToday(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertTrue(result.get(0).getIsDueToday());
        verify(billRepository).findBillsDueToday(eq(1L), any(LocalDate.class));
    }

    @Test
    void getBillsDueWithinDays_ShouldReturnBillsDueWithinSpecifiedDays() {
        // Arrange
        testBill.setNextDueDate(LocalDate.now().plusDays(5));
        List<Bill> bills = Arrays.asList(testBill);
        when(billRepository.findBillsDueWithinDays(eq(1L), any(LocalDate.class), any(LocalDate.class)))
            .thenReturn(bills);

        // Act
        List<BillResponse> result = billReminderService.getBillsDueWithinDays(1L, 7);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(billRepository).findBillsDueWithinDays(eq(1L), any(LocalDate.class), any(LocalDate.class));
    }

    @Test
    void deleteBill_ShouldDeleteBill() {
        // Arrange
        when(billRepository.findById(1L)).thenReturn(Optional.of(testBill));

        // Act
        billReminderService.deleteBill(1L, 1L);

        // Assert
        verify(billRepository).findById(1L);
        verify(billRepository).delete(testBill);
    }

    @Test
    void deleteBill_ShouldThrowExceptionWhenBillNotFound() {
        // Arrange
        when(billRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> 
            billReminderService.deleteBill(1L, 1L));
        verify(billRepository).findById(1L);
        verify(billRepository, never()).delete(any(Bill.class));
    }

    @Test
    void deleteBill_ShouldThrowExceptionWhenUnauthorized() {
        // Arrange
        testBill.setUserId(2L); // Different user
        when(billRepository.findById(1L)).thenReturn(Optional.of(testBill));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> 
            billReminderService.deleteBill(1L, 1L));
        verify(billRepository).findById(1L);
        verify(billRepository, never()).delete(any(Bill.class));
    }

    @Test
    void markBillAsPaid_ShouldCreatePaymentAndUpdateBill() {
        // Arrange
        when(billRepository.findById(1L)).thenReturn(Optional.of(testBill));
        when(billPaymentRepository.save(any(BillPayment.class))).thenReturn(testPayment);
        when(billRepository.save(any(Bill.class))).thenReturn(testBill);

        // Act
        BillPaymentResponse result = billReminderService.markBillAsPaid(1L, 1L, testPaymentRequest);

        // Assert
        assertNotNull(result);
        assertEquals(new BigDecimal("150.00"), result.getAmountPaid());
        assertEquals(BillPayment.PaymentStatus.PAID, result.getStatus());
        verify(billRepository).findById(1L);
        verify(billPaymentRepository).save(any(BillPayment.class));
        verify(billRepository).save(any(Bill.class));
    }

    @Test
    void getBillPaymentHistory_ShouldReturnPaymentHistory() {
        // Arrange
        List<BillPayment> payments = Arrays.asList(testPayment);
        when(billRepository.findById(1L)).thenReturn(Optional.of(testBill));
        when(billPaymentRepository.findByBillIdOrderByPaymentDateDesc(1L)).thenReturn(payments);

        // Act
        List<BillPaymentResponse> result = billReminderService.getBillPaymentHistory(1L, 1L);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Electric Bill", result.get(0).getBillName());
        verify(billRepository).findById(1L);
        verify(billPaymentRepository).findByBillIdOrderByPaymentDateDesc(1L);
    }

    @Test
    void getUserPaymentHistory_ShouldReturnAllUserPayments() {
        // Arrange
        List<BillPayment> payments = Arrays.asList(testPayment);
        List<Bill> bills = Arrays.asList(testBill);
        when(billPaymentRepository.findByUserIdOrderByPaymentDateDesc(1L)).thenReturn(payments);
        when(billRepository.findByUserIdOrderByNextDueDateAsc(1L)).thenReturn(bills);

        // Act
        List<BillPaymentResponse> result = billReminderService.getUserPaymentHistory(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(billPaymentRepository).findByUserIdOrderByPaymentDateDesc(1L);
        verify(billRepository).findByUserIdOrderByNextDueDateAsc(1L);
    }

    @Test
    void calculateCashFlowProjection_ShouldReturnProjection() {
        // Arrange
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = LocalDate.now().plusDays(30);
        List<Bill> bills = Arrays.asList(testBill);
        List<Transaction> transactions = Arrays.asList();

        when(billRepository.findBillsDueInDateRange(1L, startDate, endDate)).thenReturn(bills);
        when(transactionRepository.findByUserIdAndDateBetween(eq(1L), any(LocalDate.class), any(LocalDate.class)))
            .thenReturn(transactions);

        // Act
        CashFlowProjectionResponse result = billReminderService.calculateCashFlowProjection(1L, startDate, endDate);

        // Assert
        assertNotNull(result);
        assertEquals(startDate, result.getStartDate());
        assertEquals(endDate, result.getEndDate());
        assertNotNull(result.getUpcomingBills());
        assertEquals(1, result.getUpcomingBills().size());
        verify(billRepository).findBillsDueInDateRange(1L, startDate, endDate);
    }

    @Test
    void getMonthlyBillTotal_ShouldReturnMonthlyTotal() {
        // Arrange
        Double expectedTotal = 450.0; // $450 monthly total
        when(billRepository.calculateMonthlyBillTotal(1L)).thenReturn(expectedTotal);

        // Act
        BigDecimal result = billReminderService.getMonthlyBillTotal(1L);

        // Assert
        assertNotNull(result);
        assertEquals(new BigDecimal("450.0"), result);
        verify(billRepository).calculateMonthlyBillTotal(1L);
    }

    @Test
    void getMonthlyBillTotal_ShouldReturnZeroWhenNull() {
        // Arrange
        when(billRepository.calculateMonthlyBillTotal(1L)).thenReturn(null);

        // Act
        BigDecimal result = billReminderService.getMonthlyBillTotal(1L);

        // Assert
        assertNotNull(result);
        assertEquals(BigDecimal.ZERO, result);
        verify(billRepository).calculateMonthlyBillTotal(1L);
    }

    @Test
    void billFrequencyCalculation_ShouldCalculateCorrectNextDueDate() {
        // Test monthly frequency
        Bill monthlyBill = new Bill(1L, "Monthly Bill", new BigDecimal("100.00"), 
                                   "Test", Bill.BillFrequency.MONTHLY, LocalDate.now());
        
        assertNotNull(monthlyBill.getNextDueDate());
        assertTrue(monthlyBill.getNextDueDate().isAfter(LocalDate.now()) || 
                  monthlyBill.getNextDueDate().isEqual(LocalDate.now()));
    }

    @Test
    void billStatusCalculation_ShouldCalculateCorrectStatus() {
        // Test overdue bill
        Bill overdueBill = new Bill();
        overdueBill.setNextDueDate(LocalDate.now().minusDays(5));
        
        BillResponse response = new BillResponse(overdueBill);
        assertTrue(response.getIsOverdue());
        assertTrue(response.getDaysUntilDue() < 0);
    }

    @Test
    void billStatusCalculation_ShouldCalculateDueToday() {
        // Test bill due today
        Bill dueTodayBill = new Bill();
        dueTodayBill.setNextDueDate(LocalDate.now());
        
        BillResponse response = new BillResponse(dueTodayBill);
        assertTrue(response.getIsDueToday());
        assertEquals(0, response.getDaysUntilDue().intValue());
    }

    @Test
    void billStatusCalculation_ShouldCalculateReminderNeeded() {
        // Test bill needing reminder
        Bill reminderBill = new Bill();
        reminderBill.setNextDueDate(LocalDate.now().plusDays(2));
        reminderBill.setReminderDaysBefore(3);
        
        BillResponse response = new BillResponse(reminderBill);
        assertTrue(response.getNeedsReminder());
        assertEquals(2, response.getDaysUntilDue().intValue());
    }
}