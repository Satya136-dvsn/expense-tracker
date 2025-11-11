package com.budgettracker.controller;

import com.budgettracker.dto.SavingsGoalRequest;
import com.budgettracker.dto.SavingsGoalResponse;
import com.budgettracker.service.SavingsGoalService;
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
@RequestMapping("/api/savings-goals")
@CrossOrigin(origins = "*", maxAge = 3600)
public class SavingsGoalController {
    
    @Autowired
    private SavingsGoalService savingsGoalService;
    
    // Create new savings goal
    @PostMapping
    public ResponseEntity<?> createSavingsGoal(@Valid @RequestBody SavingsGoalRequest request,
                                                Authentication authentication) {
        try {
            String username = authentication.getName();
            SavingsGoalResponse goal = savingsGoalService.createSavingsGoal(request, username);
            return ResponseEntity.status(HttpStatus.CREATED).body(goal);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Get all savings goals for current user
    @GetMapping
    public ResponseEntity<List<SavingsGoalResponse>> getAllSavingsGoals(Authentication authentication) {
        String username = authentication.getName();
        List<SavingsGoalResponse> goals = savingsGoalService.getUserSavingsGoals(username);
        return ResponseEntity.ok(goals);
    }
    
    // Get active savings goals (IN_PROGRESS)
    @GetMapping("/active")
    public ResponseEntity<List<SavingsGoalResponse>> getActiveSavingsGoals(Authentication authentication) {
        String username = authentication.getName();
        List<SavingsGoalResponse> goals = savingsGoalService.getActiveSavingsGoals(username);
        return ResponseEntity.ok(goals);
    }
    
    // Get savings goals by status
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getSavingsGoalsByStatus(@PathVariable String status,
                                                      Authentication authentication) {
        try {
            String username = authentication.getName();
            List<SavingsGoalResponse> goals = savingsGoalService.getSavingsGoalsByStatus(status, username);
            return ResponseEntity.ok(goals);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Get savings goal by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getSavingsGoalById(@PathVariable Long id, Authentication authentication) {
        String username = authentication.getName();
        return savingsGoalService.getSavingsGoalById(id, username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    // Update savings goal
    @PutMapping("/{id}")
    public ResponseEntity<?> updateSavingsGoal(@PathVariable Long id,
                                                @Valid @RequestBody SavingsGoalRequest request,
                                                Authentication authentication) {
        try {
            String username = authentication.getName();
            SavingsGoalResponse goal = savingsGoalService.updateSavingsGoal(id, request, username);
            return ResponseEntity.ok(goal);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Update progress (add/subtract amount)
    @PatchMapping("/{id}/progress")
    public ResponseEntity<?> updateProgress(@PathVariable Long id,
                                            @RequestBody Map<String, BigDecimal> request,
                                            Authentication authentication) {
        try {
            String username = authentication.getName();
            BigDecimal amount = request.get("amount");
            if (amount == null) {
                return ResponseEntity.badRequest().body("Amount is required");
            }
            SavingsGoalResponse goal = savingsGoalService.updateProgress(id, amount, username);
            return ResponseEntity.ok(goal);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Set current amount directly
    @PatchMapping("/{id}/amount")
    public ResponseEntity<?> setCurrentAmount(@PathVariable Long id,
                                               @RequestBody Map<String, BigDecimal> request,
                                               Authentication authentication) {
        try {
            String username = authentication.getName();
            BigDecimal currentAmount = request.get("currentAmount");
            if (currentAmount == null) {
                return ResponseEntity.badRequest().body("Current amount is required");
            }
            SavingsGoalResponse goal = savingsGoalService.setCurrentAmount(id, currentAmount, username);
            return ResponseEntity.ok(goal);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Mark goal as completed
    @PatchMapping("/{id}/complete")
    public ResponseEntity<?> completeGoal(@PathVariable Long id, Authentication authentication) {
        try {
            String username = authentication.getName();
            SavingsGoalResponse goal = savingsGoalService.completeGoal(id, username);
            return ResponseEntity.ok(goal);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Mark goal as cancelled
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<?> cancelGoal(@PathVariable Long id, Authentication authentication) {
        try {
            String username = authentication.getName();
            SavingsGoalResponse goal = savingsGoalService.cancelGoal(id, username);
            return ResponseEntity.ok(goal);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Reopen goal (set back to IN_PROGRESS)
    @PatchMapping("/{id}/reopen")
    public ResponseEntity<?> reopenGoal(@PathVariable Long id, Authentication authentication) {
        try {
            String username = authentication.getName();
            SavingsGoalResponse goal = savingsGoalService.reopenGoal(id, username);
            return ResponseEntity.ok(goal);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Delete savings goal
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSavingsGoal(@PathVariable Long id, Authentication authentication) {
        try {
            String username = authentication.getName();
            savingsGoalService.deleteSavingsGoal(id, username);
            return ResponseEntity.ok("Savings goal deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
