package com.budgettracker.controller;

import com.budgettracker.dto.*;
import com.budgettracker.model.Bill;
import com.budgettracker.service.BillReminderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bills")
@CrossOrigin(origins = "*")
public class BillController {
    
    @Autowired
    private BillReminderService billReminderService;
    
    /**
     * Create a new bill
     */
    @PostMapping
    public ResponseEntity<BillResponse> createBill(@Valid @RequestBody BillRequest request, 
                                                  Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getName());
            BillResponse response = billReminderService.createBill(userId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    /**
     * Update an existing bill
     */
    @PutMapping("/{billId}")
    public ResponseEntity<BillResponse> updateBill(@PathVariable Long billId,
                                                  @Valid @RequestBody BillRequest request,
                                                  Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getName());
            BillResponse response = billReminderService.updateBill(userId, billId, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    /**
     * Get all bills for the authenticated user
     */
    @GetMapping
    public ResponseEntity<List<BillResponse>> getUserBills(Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getName());
            List<BillResponse> bills = billReminderService.getUserBills(userId);
            return ResponseEntity.ok(bills);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get bills by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<BillResponse>> getBillsByStatus(@PathVariable String status,
                                                              Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getName());
            Bill.BillStatus billStatus = Bill.BillStatus.valueOf(status.toUpperCase());
            List<BillResponse> bills = billReminderService.getBillsByStatus(userId, billStatus);
            return ResponseEntity.ok(bills);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get bills due within a date range
     */
    @GetMapping("/due-range")
    public ResponseEntity<List<BillResponse>> getBillsDueInRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getName());
            List<BillResponse> bills = billReminderService.getBillsDueInRange(userId, startDate, endDate);
            return ResponseEntity.ok(bills);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    /**
     * Get overdue bills
     */
    @GetMapping("/overdue")
    public ResponseEntity<List<BillResponse>> getOverdueBills(Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getName());
            List<BillResponse> bills = billReminderService.getOverdueBills(userId);
            return ResponseEntity.ok(bills);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get bills due today
     */
    @GetMapping("/due-today")
    public ResponseEntity<List<BillResponse>> getBillsDueToday(Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getName());
            List<BillResponse> bills = billReminderService.getBillsDueToday(userId);
            return ResponseEntity.ok(bills);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get bills due within the next N days
     */
    @GetMapping("/due-within/{days}")
    public ResponseEntity<List<BillResponse>> getBillsDueWithinDays(@PathVariable int days,
                                                                   Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getName());
            List<BillResponse> bills = billReminderService.getBillsDueWithinDays(userId, days);
            return ResponseEntity.ok(bills);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    /**
     * Get bills that need reminders
     */
    @GetMapping("/reminders")
    public ResponseEntity<List<BillResponse>> getBillsNeedingReminders(Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getName());
            List<BillResponse> bills = billReminderService.getBillsNeedingReminders(userId);
            return ResponseEntity.ok(bills);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Delete a bill
     */
    @DeleteMapping("/{billId}")
    public ResponseEntity<Void> deleteBill(@PathVariable Long billId, Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getName());
            billReminderService.deleteBill(userId, billId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Mark bill as paid
     */
    @PostMapping("/{billId}/payments")
    public ResponseEntity<BillPaymentResponse> markBillAsPaid(@PathVariable Long billId,
                                                             @Valid @RequestBody BillPaymentRequest request,
                                                             Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getName());
            BillPaymentResponse response = billReminderService.markBillAsPaid(userId, billId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    /**
     * Get payment history for a specific bill
     */
    @GetMapping("/{billId}/payments")
    public ResponseEntity<List<BillPaymentResponse>> getBillPaymentHistory(@PathVariable Long billId,
                                                                          Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getName());
            List<BillPaymentResponse> payments = billReminderService.getBillPaymentHistory(userId, billId);
            return ResponseEntity.ok(payments);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get all payment history for the user
     */
    @GetMapping("/payments")
    public ResponseEntity<List<BillPaymentResponse>> getUserPaymentHistory(Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getName());
            List<BillPaymentResponse> payments = billReminderService.getUserPaymentHistory(userId);
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get cash flow projection including bills
     */
    @GetMapping("/cash-flow-projection")
    public ResponseEntity<CashFlowProjectionResponse> getCashFlowProjection(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getName());
            CashFlowProjectionResponse projection = billReminderService.calculateCashFlowProjection(userId, startDate, endDate);
            return ResponseEntity.ok(projection);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    /**
     * Get monthly bill total
     */
    @GetMapping("/monthly-total")
    public ResponseEntity<BigDecimal> getMonthlyBillTotal(Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getName());
            BigDecimal total = billReminderService.getMonthlyBillTotal(userId);
            return ResponseEntity.ok(total);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}