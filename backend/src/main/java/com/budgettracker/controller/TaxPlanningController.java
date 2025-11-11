package com.budgettracker.controller;

import com.budgettracker.dto.TaxCalculationResponse;
import com.budgettracker.dto.TaxPlanRequest;
import com.budgettracker.model.TaxPlan;
import com.budgettracker.service.TaxPlanningService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/tax-planning")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TaxPlanningController {
    
    @Autowired
    private TaxPlanningService taxPlanningService;
    
    // Create or update tax plan
    @PostMapping("/plan")
    public ResponseEntity<?> createOrUpdateTaxPlan(@Valid @RequestBody TaxPlanRequest request,
                                                   Authentication authentication) {
        try {
            String username = authentication.getName();
            TaxPlan taxPlan = taxPlanningService.createOrUpdateTaxPlan(request, username);
            return ResponseEntity.ok(taxPlan);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Calculate comprehensive tax information
    @PostMapping("/calculate")
    public ResponseEntity<?> calculateTaxes(@Valid @RequestBody TaxPlanRequest request,
                                            Authentication authentication) {
        try {
            String username = authentication.getName();
            TaxPlan taxPlan = taxPlanningService.createOrUpdateTaxPlan(request, username);
            TaxCalculationResponse calculation = taxPlanningService.calculateTaxes(taxPlan);
            return ResponseEntity.ok(calculation);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Calculate tax brackets for given income and filing status
    @GetMapping("/brackets")
    public ResponseEntity<?> calculateTaxBrackets(@RequestParam BigDecimal income,
                                                  @RequestParam TaxPlan.FilingStatus filingStatus) {
        try {
            TaxCalculationResponse response = taxPlanningService.calculateTaxBrackets(income, filingStatus);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Optimize tax-advantaged account contributions
    @GetMapping("/optimize-contributions")
    public ResponseEntity<?> optimizeContributions(@RequestParam BigDecimal income,
                                                   @RequestParam TaxPlan.FilingStatus filingStatus,
                                                   @RequestParam(defaultValue = "30") Integer age) {
        try {
            Map<String, Object> optimization = taxPlanningService.optimizeContributions(income, filingStatus, age);
            return ResponseEntity.ok(optimization);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Calculate tax-loss harvesting opportunities
    @GetMapping("/tax-loss-harvesting")
    public ResponseEntity<?> calculateTaxLossHarvesting(@RequestParam BigDecimal capitalGains,
                                                        @RequestParam BigDecimal capitalLosses,
                                                        @RequestParam BigDecimal marginalTaxRate) {
        try {
            Map<String, Object> analysis = taxPlanningService.calculateTaxLossHarvesting(
                    capitalGains, capitalLosses, marginalTaxRate.divide(new BigDecimal("100")));
            return ResponseEntity.ok(analysis);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Get quick tax estimate
    @GetMapping("/quick-estimate")
    public ResponseEntity<?> getQuickTaxEstimate(@RequestParam BigDecimal income,
                                                 @RequestParam TaxPlan.FilingStatus filingStatus,
                                                 @RequestParam(defaultValue = "0") BigDecimal deductions) {
        try {
            // Create a simple tax plan for quick calculation
            TaxPlanRequest quickRequest = new TaxPlanRequest();
            quickRequest.setTaxYear(2024);
            quickRequest.setFilingStatus(filingStatus);
            quickRequest.setAnnualIncome(income);
            quickRequest.setItemizedDeductions(deductions);
            
            // Use a dummy user for calculation (this is just for estimation)
            TaxCalculationResponse brackets = taxPlanningService.calculateTaxBrackets(income, filingStatus);
            
            Map<String, Object> estimate = Map.of(
                    "income", income,
                    "filingStatus", filingStatus.name(),
                    "estimatedFederalTax", brackets.getFederalTaxOwed(),
                    "effectiveTaxRate", brackets.getEffectiveTaxRate(),
                    "marginalTaxRate", brackets.getMarginalTaxRate(),
                    "taxBrackets", brackets.getFederalTaxBrackets()
            );
            
            return ResponseEntity.ok(estimate);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Compare itemized vs standard deduction
    @PostMapping("/deduction-comparison")
    public ResponseEntity<?> compareDeductions(@RequestBody Map<String, BigDecimal> deductions,
                                               @RequestParam TaxPlan.FilingStatus filingStatus) {
        try {
            // Calculate standard deduction (simplified)
            BigDecimal standardDeduction;
            switch (filingStatus) {
                case SINGLE:
                case MARRIED_FILING_SEPARATELY:
                    standardDeduction = new BigDecimal("13850");
                    break;
                case MARRIED_FILING_JOINTLY:
                case QUALIFYING_WIDOW:
                    standardDeduction = new BigDecimal("27700");
                    break;
                case HEAD_OF_HOUSEHOLD:
                    standardDeduction = new BigDecimal("20800");
                    break;
                default:
                    standardDeduction = new BigDecimal("13850");
            }
            
            // Calculate itemized deductions
            BigDecimal itemizedTotal = deductions.values().stream()
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // Apply SALT cap
            BigDecimal saltDeduction = deductions.getOrDefault("stateLocalTaxes", BigDecimal.ZERO);
            BigDecimal saltCap = new BigDecimal("10000");
            if (saltDeduction.compareTo(saltCap) > 0) {
                itemizedTotal = itemizedTotal.subtract(saltDeduction.subtract(saltCap));
            }
            
            boolean shouldItemize = itemizedTotal.compareTo(standardDeduction) > 0;
            BigDecimal benefit = shouldItemize ? 
                    itemizedTotal.subtract(standardDeduction) : 
                    standardDeduction.subtract(itemizedTotal);
            
            Map<String, Object> comparison = Map.of(
                    "standardDeduction", standardDeduction,
                    "itemizedDeductions", itemizedTotal,
                    "shouldItemize", shouldItemize,
                    "benefit", benefit,
                    "recommendation", shouldItemize ? 
                            "Itemize deductions for additional tax savings" : 
                            "Take the standard deduction"
            );
            
            return ResponseEntity.ok(comparison);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}