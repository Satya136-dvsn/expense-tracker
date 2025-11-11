package com.budgettracker.controller;

import com.budgettracker.dto.BankAccountRequest;
import com.budgettracker.dto.BankAccountResponse;
import com.budgettracker.service.BankIntegrationService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bank-integration")
@CrossOrigin(origins = "*")
public class BankIntegrationController {
    
    private static final Logger logger = LoggerFactory.getLogger(BankIntegrationController.class);
    
    @Autowired
    private BankIntegrationService bankIntegrationService;
    
    /**
     * Get all bank accounts for the current user
     */
    @GetMapping("/accounts")
    public ResponseEntity<List<BankAccountResponse>> getUserBankAccounts() {
        logger.debug("GET /api/bank-integration/accounts - Fetching user bank accounts");
        
        try {
            Long userId = getCurrentUserId();
            List<BankAccountResponse> accounts = bankIntegrationService.getUserBankAccounts(userId);
            return ResponseEntity.ok(accounts);
        } catch (Exception e) {
            logger.error("Error fetching bank accounts: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Add a new bank account
     */
    @PostMapping("/accounts")
    public ResponseEntity<BankAccountResponse> addBankAccount(@Valid @RequestBody BankAccountRequest request) {
        logger.info("POST /api/bank-integration/accounts - Adding new bank account");
        
        try {
            Long userId = getCurrentUserId();
            BankAccountResponse account = bankIntegrationService.addBankAccount(userId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(account);
        } catch (RuntimeException e) {
            logger.error("Error adding bank account: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Unexpected error adding bank account: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Update account balance
     */
    @PutMapping("/accounts/{accountId}/balance")
    public ResponseEntity<BankAccountResponse> updateAccountBalance(
            @PathVariable Long accountId,
            @RequestBody Map<String, BigDecimal> request) {
        
        logger.info("PUT /api/bank-integration/accounts/{}/balance - Updating account balance", accountId);
        
        try {
            BigDecimal newBalance = request.get("balance");
            if (newBalance == null) {
                return ResponseEntity.badRequest().build();
            }
            
            BankAccountResponse account = bankIntegrationService.updateAccountBalance(accountId, newBalance);
            return ResponseEntity.ok(account);
        } catch (RuntimeException e) {
            logger.error("Error updating account balance: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Unexpected error updating account balance: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Sync account data
     */
    @PostMapping("/accounts/{accountId}/sync")
    public ResponseEntity<String> syncAccountData(@PathVariable Long accountId) {
        logger.info("POST /api/bank-integration/accounts/{}/sync - Syncing account data", accountId);
        
        try {
            bankIntegrationService.syncAccountData(accountId);
            return ResponseEntity.ok("Account sync initiated successfully");
        } catch (RuntimeException e) {
            logger.error("Error syncing account data: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Failed to sync account: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error syncing account data: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to sync account: " + e.getMessage());
        }
    }
    
    /**
     * Sync all accounts for the current user
     */
    @PostMapping("/accounts/sync-all")
    public ResponseEntity<String> syncAllAccounts() {
        logger.info("POST /api/bank-integration/accounts/sync-all - Syncing all user accounts");
        
        try {
            Long userId = getCurrentUserId();
            bankIntegrationService.syncAllUserAccounts(userId);
            return ResponseEntity.ok("All accounts sync initiated successfully");
        } catch (Exception e) {
            logger.error("Error syncing all accounts: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to sync accounts: " + e.getMessage());
        }
    }
    
    /**
     * Disconnect a bank account
     */
    @DeleteMapping("/accounts/{accountId}")
    public ResponseEntity<String> disconnectBankAccount(@PathVariable Long accountId) {
        logger.info("DELETE /api/bank-integration/accounts/{} - Disconnecting bank account", accountId);
        
        try {
            bankIntegrationService.disconnectBankAccount(accountId);
            return ResponseEntity.ok("Bank account disconnected successfully");
        } catch (RuntimeException e) {
            logger.error("Error disconnecting bank account: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Failed to disconnect account: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error disconnecting bank account: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to disconnect account: " + e.getMessage());
        }
    }
    
    /**
     * Get total account balance for the current user
     */
    @GetMapping("/accounts/total-balance")
    public ResponseEntity<Map<String, BigDecimal>> getTotalBalance() {
        logger.debug("GET /api/bank-integration/accounts/total-balance - Fetching total balance");
        
        try {
            Long userId = getCurrentUserId();
            BigDecimal totalBalance = bankIntegrationService.getTotalAccountBalance(userId);
            return ResponseEntity.ok(Map.of("totalBalance", totalBalance));
        } catch (Exception e) {
            logger.error("Error fetching total balance: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get account types enum values
     */
    @GetMapping("/account-types")
    public ResponseEntity<List<String>> getAccountTypes() {
        logger.debug("GET /api/bank-integration/account-types - Fetching account types");
        
        try {
            List<String> accountTypes = List.of(
                "CHECKING",
                "SAVINGS", 
                "CREDIT_CARD",
                "INVESTMENT",
                "LOAN",
                "MORTGAGE",
                "OTHER"
            );
            return ResponseEntity.ok(accountTypes);
        } catch (Exception e) {
            logger.error("Error fetching account types: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "Bank Integration Service",
                "timestamp", java.time.LocalDateTime.now().toString()
        ));
    }
    
    /**
     * Get current user ID from security context
     */
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
        
        // Assuming the principal contains the user ID or username
        String principal = authentication.getName();
        try {
            return Long.parseLong(principal);
        } catch (NumberFormatException e) {
            // If principal is username, you might need to look up the user ID
            throw new RuntimeException("Unable to determine user ID from authentication");
        }
    }
}