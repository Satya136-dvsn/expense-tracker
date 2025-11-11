package com.budgettracker.controller;

import com.budgettracker.dto.DebtRequest;
import com.budgettracker.dto.DebtResponse;
import com.budgettracker.service.DebtService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/debts")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DebtController {
    
    @Autowired
    private DebtService debtService;
    
    // Create new debt
    @PostMapping
    public ResponseEntity<?> createDebt(@Valid @RequestBody DebtRequest request,
                                        Authentication authentication) {
        try {
            String username = authentication.getName();
            DebtResponse debt = debtService.createDebt(request, username);
            return ResponseEntity.status(HttpStatus.CREATED).body(debt);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Get all debts for current user
    @GetMapping
    public ResponseEntity<List<DebtResponse>> getAllDebts(Authentication authentication) {
        String username = authentication.getName();
        List<DebtResponse> debts = debtService.getUserDebts(username);
        return ResponseEntity.ok(debts);
    }
    
    // Get active debts (ACTIVE status)
    @GetMapping("/active")
    public ResponseEntity<List<DebtResponse>> getActiveDebts(Authentication authentication) {
        String username = authentication.getName();
        List<DebtResponse> debts = debtService.getActiveDebts(username);
        return ResponseEntity.ok(debts);
    }
    
    // Get debts by status
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getDebtsByStatus(@PathVariable String status,
                                              Authentication authentication) {
        try {
            String username = authentication.getName();
            List<DebtResponse> debts = debtService.getDebtsByStatus(status, username);
            return ResponseEntity.ok(debts);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Get debt by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getDebtById(@PathVariable Long id, Authentication authentication) {
        String username = authentication.getName();
        return debtService.getDebtById(id, username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    // Update debt
    @PutMapping("/{id}")
    public ResponseEntity<?> updateDebt(@PathVariable Long id,
                                        @Valid @RequestBody DebtRequest request,
                                        Authentication authentication) {
        try {
            String username = authentication.getName();
            DebtResponse debt = debtService.updateDebt(id, request, username);
            return ResponseEntity.ok(debt);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Update debt balance
    @PatchMapping("/{id}/balance")
    public ResponseEntity<?> updateBalance(@PathVariable Long id,
                                           @RequestBody Map<String, BigDecimal> request,
                                           Authentication authentication) {
        try {
            String username = authentication.getName();
            BigDecimal newBalance = request.get("balance");
            if (newBalance == null) {
                return ResponseEntity.badRequest().body("Balance is required");
            }
            DebtResponse debt = debtService.updateBalance(id, newBalance, username);
            return ResponseEntity.ok(debt);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Make payment (reduce balance)
    @PatchMapping("/{id}/payment")
    public ResponseEntity<?> makePayment(@PathVariable Long id,
                                         @RequestBody Map<String, BigDecimal> request,
                                         Authentication authentication) {
        try {
            String username = authentication.getName();
            BigDecimal paymentAmount = request.get("amount");
            if (paymentAmount == null) {
                return ResponseEntity.badRequest().body("Payment amount is required");
            }
            DebtResponse debt = debtService.makePayment(id, paymentAmount, username);
            return ResponseEntity.ok(debt);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Mark debt as paid off
    @PatchMapping("/{id}/pay-off")
    public ResponseEntity<?> markAsPaidOff(@PathVariable Long id, Authentication authentication) {
        try {
            String username = authentication.getName();
            DebtResponse debt = debtService.markAsPaidOff(id, username);
            return ResponseEntity.ok(debt);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Reactivate debt
    @PatchMapping("/{id}/reactivate")
    public ResponseEntity<?> reactivateDebt(@PathVariable Long id, Authentication authentication) {
        try {
            String username = authentication.getName();
            DebtResponse debt = debtService.reactivateDebt(id, username);
            return ResponseEntity.ok(debt);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Delete debt
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDebt(@PathVariable Long id, Authentication authentication) {
        try {
            String username = authentication.getName();
            debtService.deleteDebt(id, username);
            return ResponseEntity.ok("Debt deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Get debt summary statistics
    @GetMapping("/summary")
    public ResponseEntity<?> getDebtSummary(Authentication authentication) {
        try {
            String username = authentication.getName();
            Map<String, Object> summary = debtService.getDebtSummary(username);
            return ResponseEntity.ok(summary);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}