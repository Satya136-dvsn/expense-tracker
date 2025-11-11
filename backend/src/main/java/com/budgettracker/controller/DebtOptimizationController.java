package com.budgettracker.controller;

import com.budgettracker.dto.*;
import com.budgettracker.service.DebtOptimizationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/debt-optimization")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DebtOptimizationController {
    
    @Autowired
    private DebtOptimizationService debtOptimizationService;
    
    // Calculate debt avalanche strategy (highest interest first)
    @PostMapping("/avalanche")
    public ResponseEntity<?> calculateAvalancheStrategy(@Valid @RequestBody DebtOptimizationRequest request,
                                                        Authentication authentication) {
        try {
            String username = authentication.getName();
            DebtOptimizationResponse response = debtOptimizationService.calculateAvalancheStrategy(request, username);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Calculate debt snowball strategy (smallest balance first)
    @PostMapping("/snowball")
    public ResponseEntity<?> calculateSnowballStrategy(@Valid @RequestBody DebtOptimizationRequest request,
                                                       Authentication authentication) {
        try {
            String username = authentication.getName();
            DebtOptimizationResponse response = debtOptimizationService.calculateSnowballStrategy(request, username);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Compare both strategies and get recommendation
    @PostMapping("/compare")
    public ResponseEntity<?> compareStrategies(@Valid @RequestBody DebtOptimizationRequest request,
                                               Authentication authentication) {
        try {
            String username = authentication.getName();
            DebtOptimizationResponse.DebtOptimizationComparison comparison = 
                    debtOptimizationService.compareStrategies(request, username);
            return ResponseEntity.ok(comparison);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Analyze debt consolidation options
    @PostMapping("/consolidation")
    public ResponseEntity<?> analyzeConsolidation(@RequestParam BigDecimal consolidationRate,
                                                  Authentication authentication) {
        try {
            String username = authentication.getName();
            DebtConsolidationResponse response = debtOptimizationService.analyzeConsolidation(consolidationRate, username);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Compare minimum payments vs accelerated payments
    @PostMapping("/payment-comparison")
    public ResponseEntity<?> comparePaymentStrategies(@RequestParam BigDecimal extraPayment,
                                                      Authentication authentication) {
        try {
            String username = authentication.getName();
            Map<String, Object> comparison = debtOptimizationService.comparePaymentStrategies(extraPayment, username);
            return ResponseEntity.ok(comparison);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Get quick optimization recommendation
    @GetMapping("/quick-recommendation")
    public ResponseEntity<?> getQuickRecommendation(@RequestParam(defaultValue = "100") BigDecimal extraPayment,
                                                    Authentication authentication) {
        try {
            String username = authentication.getName();
            DebtOptimizationRequest request = new DebtOptimizationRequest(extraPayment);
            DebtOptimizationResponse.DebtOptimizationComparison comparison = 
                    debtOptimizationService.compareStrategies(request, username);
            
            // Return simplified recommendation
            Map<String, Object> quickRec = Map.of(
                    "recommendedStrategy", comparison.getRecommendedStrategy(),
                    "recommendationReason", comparison.getRecommendationReason(),
                    "avalancheInterest", comparison.getAvalancheStrategy().getTotalInterestPaid(),
                    "snowballInterest", comparison.getSnowballStrategy().getTotalInterestPaid(),
                    "avalancheTime", comparison.getAvalancheStrategy().getPayoffTimeMonths(),
                    "snowballTime", comparison.getSnowballStrategy().getPayoffTimeMonths(),
                    "extraPaymentAmount", extraPayment
            );
            
            return ResponseEntity.ok(quickRec);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}