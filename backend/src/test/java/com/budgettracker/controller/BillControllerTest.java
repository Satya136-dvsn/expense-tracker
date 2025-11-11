package com.budgettracker.controller;

import com.budgettracker.dto.*;
import com.budgettracker.model.Bill;
import com.budgettracker.model.BillPayment;
import com.budgettracker.service.BillReminderService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BillController.class)
class BillControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BillReminderService billReminderService;

    private BillRequest testBillRequest;
    private BillResponse testBillResponse;
    private BillPaymentRequest testPaymentRequest;
    private BillPaymentResponse testPaymentResponse;
    private CashFlowProjectionResponse testProjectionResponse;

    @BeforeEach
    void setUp() {
        testBillRequest = new BillRequest();
        testBillRequest.setName("Electric Bill");
        testBillRequest.setAmount(new BigDecimal("150.00"));
        testBillRequest.setCategory("Utilities");
        testBillRequest.setFrequency(Bill.BillFrequency.MONTHLY);
        testBillRequest.setDueDate(LocalDate.now().plusDays(15));
        testBillRequest.setReminderDaysBefore(3);

        testBillResponse = new BillResponse();
        testBillResponse.setId(1L);
        testBillResponse.setName("Electric Bill");
        testBillResponse.setAmount(new BigDecimal("150.00"));
        testBillResponse.setCategory("Utilities");
        testBillResponse.setFrequency(Bill.BillFrequency.MONTHLY);
        testBillResponse.setDueDate(LocalDate.now().plusDays(15));
        testBillResponse.setNextDueDate(LocalDate.now().plusDays(15));
        testBillResponse.setStatus(Bill.BillStatus.ACTIVE);

        testPaymentRequest = new BillPaymentRequest();
        testPaymentRequest.setBillId(1L);
        testPaymentRequest.setAmountPaid(new BigDecimal("150.00"));
        testPaymentRequest.setPaymentDate(LocalDate.now());
        testPaymentRequest.setDueDate(LocalDate.now());
        testPaymentRequest.setStatus(BillPayment.PaymentStatus.PAID);

        testPaymentResponse = new BillPaymentResponse();
        testPaymentResponse.setId(1L);
        testPaymentResponse.setBillId(1L);
        testPaymentResponse.setBillName("Electric Bill");
        testPaymentResponse.setAmountPaid(new BigDecimal("150.00"));
        testPaymentResponse.setStatus(BillPayment.PaymentStatus.PAID);

        testProjectionResponse = new CashFlowProjectionResponse();
        testProjectionResponse.setStartDate(LocalDate.now());
        testProjectionResponse.setEndDate(LocalDate.now().plusDays(30));
        testProjectionResponse.setStartingBalance(new BigDecimal("1000.00"));
        testProjectionResponse.setTotalBillPayments(new BigDecimal("300.00"));
    }

    @Test
    @WithMockUser(username = "1")
    void createBill_ShouldReturnCreatedBill() throws Exception {
        // Arrange
        when(billReminderService.createBill(eq(1L), any(BillRequest.class))).thenReturn(testBillResponse);

        // Act & Assert
        mockMvc.perform(post("/api/bills")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testBillRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Electric Bill"))
                .andExpect(jsonPath("$.amount").value(150.00))
                .andExpect(jsonPath("$.category").value("Utilities"))
                .andExpect(jsonPath("$.frequency").value("MONTHLY"));

        verify(billReminderService).createBill(eq(1L), any(BillRequest.class));
    }

    @Test
    @WithMockUser(username = "1")
    void createBill_ShouldReturnBadRequestForInvalidData() throws Exception {
        // Arrange
        testBillRequest.setName(""); // Invalid empty name
        when(billReminderService.createBill(eq(1L), any(BillRequest.class)))
            .thenThrow(new RuntimeException("Invalid data"));

        // Act & Assert
        mockMvc.perform(post("/api/bills")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testBillRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "1")
    void updateBill_ShouldReturnUpdatedBill() throws Exception {
        // Arrange
        when(billReminderService.updateBill(eq(1L), eq(1L), any(BillRequest.class)))
            .thenReturn(testBillResponse);

        // Act & Assert
        mockMvc.perform(put("/api/bills/1")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testBillRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Electric Bill"));

        verify(billReminderService).updateBill(eq(1L), eq(1L), any(BillRequest.class));
    }

    @Test
    @WithMockUser(username = "1")
    void updateBill_ShouldReturnNotFoundForNonexistentBill() throws Exception {
        // Arrange
        when(billReminderService.updateBill(eq(1L), eq(1L), any(BillRequest.class)))
            .thenThrow(new RuntimeException("Bill not found"));

        // Act & Assert
        mockMvc.perform(put("/api/bills/1")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testBillRequest)))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "1")
    void getUserBills_ShouldReturnUserBills() throws Exception {
        // Arrange
        List<BillResponse> bills = Arrays.asList(testBillResponse);
        when(billReminderService.getUserBills(1L)).thenReturn(bills);

        // Act & Assert
        mockMvc.perform(get("/api/bills"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("Electric Bill"));

        verify(billReminderService).getUserBills(1L);
    }

    @Test
    @WithMockUser(username = "1")
    void getBillsByStatus_ShouldReturnBillsWithStatus() throws Exception {
        // Arrange
        List<BillResponse> bills = Arrays.asList(testBillResponse);
        when(billReminderService.getBillsByStatus(1L, Bill.BillStatus.ACTIVE)).thenReturn(bills);

        // Act & Assert
        mockMvc.perform(get("/api/bills/status/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].status").value("ACTIVE"));

        verify(billReminderService).getBillsByStatus(1L, Bill.BillStatus.ACTIVE);
    }

    @Test
    @WithMockUser(username = "1")
    void getBillsByStatus_ShouldReturnBadRequestForInvalidStatus() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/bills/status/invalid_status"))
                .andExpect(status().isBadRequest());

        verify(billReminderService, never()).getBillsByStatus(anyLong(), any());
    }

    @Test
    @WithMockUser(username = "1")
    void getBillsDueInRange_ShouldReturnBillsInDateRange() throws Exception {
        // Arrange
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = LocalDate.now().plusDays(30);
        List<BillResponse> bills = Arrays.asList(testBillResponse);
        when(billReminderService.getBillsDueInRange(1L, startDate, endDate)).thenReturn(bills);

        // Act & Assert
        mockMvc.perform(get("/api/bills/due-range")
                .param("startDate", startDate.toString())
                .param("endDate", endDate.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1));

        verify(billReminderService).getBillsDueInRange(1L, startDate, endDate);
    }

    @Test
    @WithMockUser(username = "1")
    void getOverdueBills_ShouldReturnOverdueBills() throws Exception {
        // Arrange
        testBillResponse.setIsOverdue(true);
        List<BillResponse> bills = Arrays.asList(testBillResponse);
        when(billReminderService.getOverdueBills(1L)).thenReturn(bills);

        // Act & Assert
        mockMvc.perform(get("/api/bills/overdue"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].isOverdue").value(true));

        verify(billReminderService).getOverdueBills(1L);
    }

    @Test
    @WithMockUser(username = "1")
    void getBillsDueToday_ShouldReturnBillsDueToday() throws Exception {
        // Arrange
        testBillResponse.setIsDueToday(true);
        List<BillResponse> bills = Arrays.asList(testBillResponse);
        when(billReminderService.getBillsDueToday(1L)).thenReturn(bills);

        // Act & Assert
        mockMvc.perform(get("/api/bills/due-today"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].isDueToday").value(true));

        verify(billReminderService).getBillsDueToday(1L);
    }

    @Test
    @WithMockUser(username = "1")
    void getBillsDueWithinDays_ShouldReturnBillsWithinDays() throws Exception {
        // Arrange
        List<BillResponse> bills = Arrays.asList(testBillResponse);
        when(billReminderService.getBillsDueWithinDays(1L, 7)).thenReturn(bills);

        // Act & Assert
        mockMvc.perform(get("/api/bills/due-within/7"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1));

        verify(billReminderService).getBillsDueWithinDays(1L, 7);
    }

    @Test
    @WithMockUser(username = "1")
    void getBillsNeedingReminders_ShouldReturnBillsNeedingReminders() throws Exception {
        // Arrange
        testBillResponse.setNeedsReminder(true);
        List<BillResponse> bills = Arrays.asList(testBillResponse);
        when(billReminderService.getBillsNeedingReminders(1L)).thenReturn(bills);

        // Act & Assert
        mockMvc.perform(get("/api/bills/reminders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].needsReminder").value(true));

        verify(billReminderService).getBillsNeedingReminders(1L);
    }

    @Test
    @WithMockUser(username = "1")
    void deleteBill_ShouldReturnNoContent() throws Exception {
        // Arrange
        doNothing().when(billReminderService).deleteBill(1L, 1L);

        // Act & Assert
        mockMvc.perform(delete("/api/bills/1")
                .with(csrf()))
                .andExpect(status().isNoContent());

        verify(billReminderService).deleteBill(1L, 1L);
    }

    @Test
    @WithMockUser(username = "1")
    void deleteBill_ShouldReturnNotFoundForNonexistentBill() throws Exception {
        // Arrange
        doThrow(new RuntimeException("Bill not found")).when(billReminderService).deleteBill(1L, 1L);

        // Act & Assert
        mockMvc.perform(delete("/api/bills/1")
                .with(csrf()))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "1")
    void markBillAsPaid_ShouldReturnPaymentResponse() throws Exception {
        // Arrange
        when(billReminderService.markBillAsPaid(eq(1L), eq(1L), any(BillPaymentRequest.class)))
            .thenReturn(testPaymentResponse);

        // Act & Assert
        mockMvc.perform(post("/api/bills/1/payments")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testPaymentRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.billId").value(1))
                .andExpect(jsonPath("$.billName").value("Electric Bill"))
                .andExpect(jsonPath("$.amountPaid").value(150.00))
                .andExpect(jsonPath("$.status").value("PAID"));

        verify(billReminderService).markBillAsPaid(eq(1L), eq(1L), any(BillPaymentRequest.class));
    }

    @Test
    @WithMockUser(username = "1")
    void getBillPaymentHistory_ShouldReturnPaymentHistory() throws Exception {
        // Arrange
        List<BillPaymentResponse> payments = Arrays.asList(testPaymentResponse);
        when(billReminderService.getBillPaymentHistory(1L, 1L)).thenReturn(payments);

        // Act & Assert
        mockMvc.perform(get("/api/bills/1/payments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].billName").value("Electric Bill"));

        verify(billReminderService).getBillPaymentHistory(1L, 1L);
    }

    @Test
    @WithMockUser(username = "1")
    void getUserPaymentHistory_ShouldReturnAllUserPayments() throws Exception {
        // Arrange
        List<BillPaymentResponse> payments = Arrays.asList(testPaymentResponse);
        when(billReminderService.getUserPaymentHistory(1L)).thenReturn(payments);

        // Act & Assert
        mockMvc.perform(get("/api/bills/payments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1));

        verify(billReminderService).getUserPaymentHistory(1L);
    }

    @Test
    @WithMockUser(username = "1")
    void getCashFlowProjection_ShouldReturnProjection() throws Exception {
        // Arrange
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = LocalDate.now().plusDays(30);
        when(billReminderService.calculateCashFlowProjection(1L, startDate, endDate))
            .thenReturn(testProjectionResponse);

        // Act & Assert
        mockMvc.perform(get("/api/bills/cash-flow-projection")
                .param("startDate", startDate.toString())
                .param("endDate", endDate.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.startDate").value(startDate.toString()))
                .andExpect(jsonPath("$.endDate").value(endDate.toString()))
                .andExpect(jsonPath("$.startingBalance").value(1000.00))
                .andExpect(jsonPath("$.totalBillPayments").value(300.00));

        verify(billReminderService).calculateCashFlowProjection(1L, startDate, endDate);
    }

    @Test
    @WithMockUser(username = "1")
    void getMonthlyBillTotal_ShouldReturnTotal() throws Exception {
        // Arrange
        BigDecimal total = new BigDecimal("450.00");
        when(billReminderService.getMonthlyBillTotal(1L)).thenReturn(total);

        // Act & Assert
        mockMvc.perform(get("/api/bills/monthly-total"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(450.00));

        verify(billReminderService).getMonthlyBillTotal(1L);
    }

    @Test
    void createBill_ShouldReturnUnauthorizedWithoutAuthentication() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/api/bills")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testBillRequest)))
                .andExpect(status().isUnauthorized());

        verify(billReminderService, never()).createBill(anyLong(), any(BillRequest.class));
    }

    @Test
    @WithMockUser(username = "1")
    void createBill_ShouldReturnBadRequestForMissingRequiredFields() throws Exception {
        // Arrange
        BillRequest invalidRequest = new BillRequest();
        // Missing required fields

        // Act & Assert
        mockMvc.perform(post("/api/bills")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());

        verify(billReminderService, never()).createBill(anyLong(), any(BillRequest.class));
    }

    @Test
    @WithMockUser(username = "1")
    void markBillAsPaid_ShouldReturnBadRequestForInvalidPaymentData() throws Exception {
        // Arrange
        BillPaymentRequest invalidRequest = new BillPaymentRequest();
        // Missing required fields

        // Act & Assert
        mockMvc.perform(post("/api/bills/1/payments")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());

        verify(billReminderService, never()).markBillAsPaid(anyLong(), anyLong(), any(BillPaymentRequest.class));
    }
}