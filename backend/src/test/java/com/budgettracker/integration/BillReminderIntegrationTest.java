package com.budgettracker.integration;

import com.budgettracker.dto.BillRequest;
import com.budgettracker.dto.BillResponse;
import com.budgettracker.dto.BillPaymentRequest;
import com.budgettracker.dto.BillPaymentResponse;
import com.budgettracker.dto.CashFlowProjectionResponse;
import com.budgettracker.model.Bill;
import com.budgettracker.model.BillPayment;
import com.budgettracker.model.User;
import com.budgettracker.repository.BillRepository;
import com.budgettracker.repository.BillPaymentRepository;
import com.budgettracker.repository.UserRepository;
import com.budgettracker.util.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
@Transactional
class BillReminderIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private BillPaymentRepository billPaymentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    private User testUser;
    private String authToken;
    private BillRequest testBillRequest;

    @BeforeEach
    void setUp() {
        // Create test user
        testUser = new User();
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword(passwordEncoder.encode("password"));
        testUser = userRepository.save(testUser);

        // Generate auth token
        authToken = jwtUtil.generateToken(testUser);

        // Create test bill request
        testBillRequest = new BillRequest();
        testBillRequest.setName("Electric Bill");
        testBillRequest.setDescription("Monthly electric utility bill");
        testBillRequest.setAmount(new BigDecimal("150.00"));
        testBillRequest.setCategory("Utilities");
        testBillRequest.setFrequency(Bill.BillFrequency.MONTHLY);
        testBillRequest.setDueDate(LocalDate.now().plusDays(15));
        testBillRequest.setAutoPay(false);
        testBillRequest.setReminderDaysBefore(3);
        testBillRequest.setPayee("Electric Company");
    }

    @Test
    void createBill_ShouldCreateBillSuccessfully() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/api/bills")
                .header("Authorization", "Bearer " + authToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testBillRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Electric Bill"))
                .andExpect(jsonPath("$.amount").value(150.00))
                .andExpect(jsonPath("$.category").value("Utilities"))
                .andExpect(jsonPath("$.frequency").value("MONTHLY"))
                .andExpect(jsonPath("$.autoPay").value(false))
                .andExpect(jsonPath("$.reminderDaysBefore").value(3));

        // Verify bill was saved to database
        List<Bill> bills = billRepository.findByUserIdOrderByNextDueDateAsc(testUser.getId());
        assertEquals(1, bills.size());
        assertEquals("Electric Bill", bills.get(0).getName());
    }

    @Test
    void createBill_ShouldFailWithInvalidData() throws Exception {
        // Arrange
        testBillRequest.setName(""); // Invalid empty name
        testBillRequest.setAmount(new BigDecimal("-50.00")); // Invalid negative amount

        // Act & Assert
        mockMvc.perform(post("/api/bills")
                .header("Authorization", "Bearer " + authToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testBillRequest)))
                .andExpect(status().isBadRequest());

        // Verify no bill was saved
        List<Bill> bills = billRepository.findByUserIdOrderByNextDueDateAsc(testUser.getId());
        assertEquals(0, bills.size());
    }

    @Test
    void getUserBills_ShouldReturnUserBills() throws Exception {
        // Arrange - Create a bill first
        Bill bill = new Bill(testUser.getId(), "Test Bill", new BigDecimal("100.00"), 
                           "Test", Bill.BillFrequency.MONTHLY, LocalDate.now().plusDays(10));
        billRepository.save(bill);

        // Act & Assert
        mockMvc.perform(get("/api/bills")
                .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].name").value("Test Bill"))
                .andExpect(jsonPath("$[0].amount").value(100.00));
    }

    @Test
    void updateBill_ShouldUpdateBillSuccessfully() throws Exception {
        // Arrange - Create a bill first
        Bill bill = new Bill(testUser.getId(), "Original Bill", new BigDecimal("100.00"), 
                           "Test", Bill.BillFrequency.MONTHLY, LocalDate.now().plusDays(10));
        bill = billRepository.save(bill);

        testBillRequest.setName("Updated Bill");
        testBillRequest.setAmount(new BigDecimal("200.00"));

        // Act & Assert
        mockMvc.perform(put("/api/bills/" + bill.getId())
                .header("Authorization", "Bearer " + authToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testBillRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Bill"))
                .andExpect(jsonPath("$.amount").value(200.00));

        // Verify bill was updated in database
        Bill updatedBill = billRepository.findById(bill.getId()).orElse(null);
        assertNotNull(updatedBill);
        assertEquals("Updated Bill", updatedBill.getName());
        assertEquals(new BigDecimal("200.00"), updatedBill.getAmount());
    }

    @Test
    void deleteBill_ShouldDeleteBillSuccessfully() throws Exception {
        // Arrange - Create a bill first
        Bill bill = new Bill(testUser.getId(), "Test Bill", new BigDecimal("100.00"), 
                           "Test", Bill.BillFrequency.MONTHLY, LocalDate.now().plusDays(10));
        bill = billRepository.save(bill);

        // Act & Assert
        mockMvc.perform(delete("/api/bills/" + bill.getId())
                .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isNoContent());

        // Verify bill was deleted from database
        assertFalse(billRepository.findById(bill.getId()).isPresent());
    }

    @Test
    void getBillsDueToday_ShouldReturnBillsDueToday() throws Exception {
        // Arrange - Create bills with different due dates
        Bill dueTodayBill = new Bill(testUser.getId(), "Due Today", new BigDecimal("100.00"), 
                                   "Test", Bill.BillFrequency.MONTHLY, LocalDate.now());
        dueTodayBill.setNextDueDate(LocalDate.now());
        
        Bill futureBill = new Bill(testUser.getId(), "Future Bill", new BigDecimal("200.00"), 
                                 "Test", Bill.BillFrequency.MONTHLY, LocalDate.now().plusDays(10));
        futureBill.setNextDueDate(LocalDate.now().plusDays(10));

        billRepository.save(dueTodayBill);
        billRepository.save(futureBill);

        // Act & Assert
        mockMvc.perform(get("/api/bills/due-today")
                .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Due Today"))
                .andExpect(jsonPath("$[0].isDueToday").value(true));
    }

    @Test
    void getOverdueBills_ShouldReturnOverdueBills() throws Exception {
        // Arrange - Create overdue bill
        Bill overdueBill = new Bill(testUser.getId(), "Overdue Bill", new BigDecimal("100.00"), 
                                  "Test", Bill.BillFrequency.MONTHLY, LocalDate.now().minusDays(5));
        overdueBill.setNextDueDate(LocalDate.now().minusDays(5));
        billRepository.save(overdueBill);

        // Act & Assert
        mockMvc.perform(get("/api/bills/overdue")
                .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Overdue Bill"))
                .andExpect(jsonPath("$[0].isOverdue").value(true));
    }

    @Test
    void getBillsDueWithinDays_ShouldReturnBillsInRange() throws Exception {
        // Arrange - Create bills within and outside the range
        Bill withinRangeBill = new Bill(testUser.getId(), "Within Range", new BigDecimal("100.00"), 
                                      "Test", Bill.BillFrequency.MONTHLY, LocalDate.now().plusDays(5));
        withinRangeBill.setNextDueDate(LocalDate.now().plusDays(5));
        
        Bill outsideRangeBill = new Bill(testUser.getId(), "Outside Range", new BigDecimal("200.00"), 
                                       "Test", Bill.BillFrequency.MONTHLY, LocalDate.now().plusDays(15));
        outsideRangeBill.setNextDueDate(LocalDate.now().plusDays(15));

        billRepository.save(withinRangeBill);
        billRepository.save(outsideRangeBill);

        // Act & Assert
        mockMvc.perform(get("/api/bills/due-within/7")
                .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Within Range"));
    }

    @Test
    void markBillAsPaid_ShouldCreatePaymentRecord() throws Exception {
        // Arrange - Create a bill first
        Bill bill = new Bill(testUser.getId(), "Test Bill", new BigDecimal("100.00"), 
                           "Test", Bill.BillFrequency.MONTHLY, LocalDate.now());
        bill = billRepository.save(bill);

        BillPaymentRequest paymentRequest = new BillPaymentRequest();
        paymentRequest.setBillId(bill.getId());
        paymentRequest.setAmountPaid(new BigDecimal("100.00"));
        paymentRequest.setPaymentDate(LocalDate.now());
        paymentRequest.setDueDate(LocalDate.now());
        paymentRequest.setStatus(BillPayment.PaymentStatus.PAID);
        paymentRequest.setPaymentMethod(BillPayment.PaymentMethod.CREDIT_CARD);

        // Act & Assert
        mockMvc.perform(post("/api/bills/" + bill.getId() + "/payments")
                .header("Authorization", "Bearer " + authToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(paymentRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.amountPaid").value(100.00))
                .andExpect(jsonPath("$.status").value("PAID"))
                .andExpect(jsonPath("$.billName").value("Test Bill"));

        // Verify payment was saved to database
        List<BillPayment> payments = billPaymentRepository.findByBillIdOrderByPaymentDateDesc(bill.getId());
        assertEquals(1, payments.size());
        assertEquals(new BigDecimal("100.00"), payments.get(0).getAmountPaid());
    }

    @Test
    void getBillPaymentHistory_ShouldReturnPaymentHistory() throws Exception {
        // Arrange - Create bill and payment
        Bill bill = new Bill(testUser.getId(), "Test Bill", new BigDecimal("100.00"), 
                           "Test", Bill.BillFrequency.MONTHLY, LocalDate.now());
        bill = billRepository.save(bill);

        BillPayment payment = new BillPayment(bill.getId(), testUser.getId(), new BigDecimal("100.00"),
                                            LocalDate.now(), LocalDate.now(), BillPayment.PaymentStatus.PAID);
        billPaymentRepository.save(payment);

        // Act & Assert
        mockMvc.perform(get("/api/bills/" + bill.getId() + "/payments")
                .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].amountPaid").value(100.00))
                .andExpect(jsonPath("$[0].status").value("PAID"));
    }

    @Test
    void getUserPaymentHistory_ShouldReturnAllUserPayments() throws Exception {
        // Arrange - Create multiple bills and payments
        Bill bill1 = new Bill(testUser.getId(), "Bill 1", new BigDecimal("100.00"), 
                            "Test", Bill.BillFrequency.MONTHLY, LocalDate.now());
        Bill bill2 = new Bill(testUser.getId(), "Bill 2", new BigDecimal("200.00"), 
                            "Test", Bill.BillFrequency.MONTHLY, LocalDate.now());
        bill1 = billRepository.save(bill1);
        bill2 = billRepository.save(bill2);

        BillPayment payment1 = new BillPayment(bill1.getId(), testUser.getId(), new BigDecimal("100.00"),
                                             LocalDate.now(), LocalDate.now(), BillPayment.PaymentStatus.PAID);
        BillPayment payment2 = new BillPayment(bill2.getId(), testUser.getId(), new BigDecimal("200.00"),
                                             LocalDate.now(), LocalDate.now(), BillPayment.PaymentStatus.PAID);
        billPaymentRepository.save(payment1);
        billPaymentRepository.save(payment2);

        // Act & Assert
        mockMvc.perform(get("/api/bills/payments")
                .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void getCashFlowProjection_ShouldReturnProjection() throws Exception {
        // Arrange - Create bills for projection
        Bill bill1 = new Bill(testUser.getId(), "Bill 1", new BigDecimal("100.00"), 
                            "Test", Bill.BillFrequency.MONTHLY, LocalDate.now().plusDays(10));
        bill1.setNextDueDate(LocalDate.now().plusDays(10));
        
        Bill bill2 = new Bill(testUser.getId(), "Bill 2", new BigDecimal("200.00"), 
                            "Test", Bill.BillFrequency.MONTHLY, LocalDate.now().plusDays(20));
        bill2.setNextDueDate(LocalDate.now().plusDays(20));
        
        billRepository.save(bill1);
        billRepository.save(bill2);

        LocalDate startDate = LocalDate.now();
        LocalDate endDate = LocalDate.now().plusDays(30);

        // Act & Assert
        mockMvc.perform(get("/api/bills/cash-flow-projection")
                .param("startDate", startDate.toString())
                .param("endDate", endDate.toString())
                .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.startDate").value(startDate.toString()))
                .andExpect(jsonPath("$.endDate").value(endDate.toString()))
                .andExpect(jsonPath("$.upcomingBills").isArray())
                .andExpect(jsonPath("$.upcomingBills.length()").value(2))
                .andExpect(jsonPath("$.totalBillPayments").value(300.00));
    }

    @Test
    void getMonthlyBillTotal_ShouldReturnTotal() throws Exception {
        // Arrange - Create monthly bills
        Bill monthlyBill1 = new Bill(testUser.getId(), "Monthly 1", new BigDecimal("100.00"), 
                                   "Test", Bill.BillFrequency.MONTHLY, LocalDate.now());
        Bill monthlyBill2 = new Bill(testUser.getId(), "Monthly 2", new BigDecimal("200.00"), 
                                   "Test", Bill.BillFrequency.MONTHLY, LocalDate.now());
        billRepository.save(monthlyBill1);
        billRepository.save(monthlyBill2);

        // Act & Assert
        mockMvc.perform(get("/api/bills/monthly-total")
                .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(300.00));
    }

    @Test
    void unauthorizedAccess_ShouldReturnUnauthorized() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/bills"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void accessOtherUsersBill_ShouldReturnNotFound() throws Exception {
        // Arrange - Create another user and their bill
        User otherUser = new User();
        otherUser.setUsername("otheruser");
        otherUser.setEmail("other@example.com");
        otherUser.setPassword(passwordEncoder.encode("password"));
        otherUser = userRepository.save(otherUser);

        Bill otherUserBill = new Bill(otherUser.getId(), "Other User Bill", new BigDecimal("100.00"), 
                                    "Test", Bill.BillFrequency.MONTHLY, LocalDate.now());
        otherUserBill = billRepository.save(otherUserBill);

        // Act & Assert - Try to access other user's bill
        mockMvc.perform(put("/api/bills/" + otherUserBill.getId())
                .header("Authorization", "Bearer " + authToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testBillRequest)))
                .andExpect(status().isNotFound());
    }

    @Test
    void billFrequencyCalculation_ShouldCalculateCorrectNextDueDate() {
        // Test different frequencies
        Bill weeklyBill = new Bill(testUser.getId(), "Weekly", new BigDecimal("50.00"), 
                                 "Test", Bill.BillFrequency.WEEKLY, LocalDate.now());
        assertEquals(LocalDate.now().plusWeeks(1), weeklyBill.getNextDueDate());

        Bill monthlyBill = new Bill(testUser.getId(), "Monthly", new BigDecimal("100.00"), 
                                  "Test", Bill.BillFrequency.MONTHLY, LocalDate.now());
        assertEquals(LocalDate.now().plusMonths(1), monthlyBill.getNextDueDate());

        Bill yearlyBill = new Bill(testUser.getId(), "Yearly", new BigDecimal("1200.00"), 
                                 "Test", Bill.BillFrequency.ANNUALLY, LocalDate.now());
        assertEquals(LocalDate.now().plusYears(1), yearlyBill.getNextDueDate());
    }

    @Test
    void billStatusCalculation_ShouldCalculateCorrectStatus() {
        // Test overdue bill
        Bill overdueBill = new Bill();
        overdueBill.setNextDueDate(LocalDate.now().minusDays(5));
        BillResponse overdueResponse = new BillResponse(overdueBill);
        assertTrue(overdueResponse.getIsOverdue());
        assertEquals(-5, overdueResponse.getDaysUntilDue().intValue());

        // Test due today bill
        Bill dueTodayBill = new Bill();
        dueTodayBill.setNextDueDate(LocalDate.now());
        BillResponse dueTodayResponse = new BillResponse(dueTodayBill);
        assertTrue(dueTodayResponse.getIsDueToday());
        assertEquals(0, dueTodayResponse.getDaysUntilDue().intValue());

        // Test future bill needing reminder
        Bill reminderBill = new Bill();
        reminderBill.setNextDueDate(LocalDate.now().plusDays(2));
        reminderBill.setReminderDaysBefore(3);
        BillResponse reminderResponse = new BillResponse(reminderBill);
        assertTrue(reminderResponse.getNeedsReminder());
        assertEquals(2, reminderResponse.getDaysUntilDue().intValue());
    }
}