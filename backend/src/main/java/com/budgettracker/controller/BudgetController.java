package com.budgettracker.controller;

import com.budgettracker.dto.BudgetRequest;
import com.budgettracker.dto.BudgetResponse;
import com.budgettracker.service.BudgetService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin(origins = "*", maxAge = 3600)
public class BudgetController {
    
    @Autowired
    private BudgetService budgetService;
    
    // Create new budget
    @PostMapping
    public ResponseEntity<?> createBudget(@Valid @RequestBody BudgetRequest request, 
                                          Authentication authentication) {
        try {
            String username = authentication.getName();
            BudgetResponse budget = budgetService.createBudget(request, username);
            return ResponseEntity.status(HttpStatus.CREATED).body(budget);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Get all budgets for current user
    @GetMapping
    public ResponseEntity<List<BudgetResponse>> getAllBudgets(Authentication authentication) {
        String username = authentication.getName();
        List<BudgetResponse> budgets = budgetService.getUserBudgets(username);
        return ResponseEntity.ok(budgets);
    }
    
    // Get budgets for specific month and year
    @GetMapping("/month/{month}/year/{year}")
    public ResponseEntity<List<BudgetResponse>> getBudgetsForMonth(
            @PathVariable Integer month,
            @PathVariable Integer year,
            Authentication authentication) {
        String username = authentication.getName();
        List<BudgetResponse> budgets = budgetService.getBudgetsForMonth(month, year, username);
        return ResponseEntity.ok(budgets);
    }
    
    // Get current month budgets
    @GetMapping("/current-month")
    public ResponseEntity<List<BudgetResponse>> getCurrentMonthBudgets(Authentication authentication) {
        String username = authentication.getName();
        List<BudgetResponse> budgets = budgetService.getCurrentMonthBudgets(username);
        return ResponseEntity.ok(budgets);
    }
    
    // Get budget by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getBudgetById(@PathVariable Long id, Authentication authentication) {
        String username = authentication.getName();
        return budgetService.getBudgetById(id, username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    // Update budget
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBudget(@PathVariable Long id,
                                          @Valid @RequestBody BudgetRequest request,
                                          Authentication authentication) {
        try {
            String username = authentication.getName();
            BudgetResponse budget = budgetService.updateBudget(id, request, username);
            return ResponseEntity.ok(budget);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Delete budget
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBudget(@PathVariable Long id, Authentication authentication) {
        try {
            String username = authentication.getName();
            budgetService.deleteBudget(id, username);
            return ResponseEntity.ok("Budget deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Recalculate all budgets (useful after transaction changes)
    @PostMapping("/recalculate")
    public ResponseEntity<?> recalculateAllBudgets(Authentication authentication) {
        try {
            String username = authentication.getName();
            budgetService.recalculateAllBudgets(username);
            return ResponseEntity.ok("All budgets recalculated successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
