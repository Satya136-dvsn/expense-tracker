package com.budgettracker.controller;

import com.budgettracker.dto.RetirementCalculationResponse;
import com.budgettracker.dto.RetirementPlanRequest;
import com.budgettracker.model.RetirementPlan;
import com.budgettracker.service.RetirementPlanningService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/retirement")
@CrossOrigin(origins = "http://localhost:3000")
public class RetirementPlanningController {

    @Autowired
    private RetirementPlanningService retirementPlanningService;

    /**
     * Create or update a retirement plan
     */
    @PostMapping("/plan")
    public ResponseEntity<RetirementPlan> createRetirementPlan(
            @Valid @RequestBody RetirementPlanRequest request,
            Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getName());
            RetirementPlan plan = retirementPlanningService.createOrUpdateRetirementPlan(userId, request);
            return ResponseEntity.ok(plan);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get the latest retirement plan for the authenticated user
     */
    @GetMapping("/plan")
    public ResponseEntity<RetirementPlan> getRetirementPlan(Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getName());
            Optional<RetirementPlan> plan = retirementPlanningService.getRetirementPlanByUserId(userId);
            return plan.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get all retirement plans for the authenticated user
     */
    @GetMapping("/plans")
    public ResponseEntity<List<RetirementPlan>> getAllRetirementPlans(Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getName());
            List<RetirementPlan> plans = retirementPlanningService.getAllRetirementPlansByUserId(userId);
            return ResponseEntity.ok(plans);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Calculate retirement projections for a specific plan
     */
    @GetMapping("/calculate/{planId}")
    public ResponseEntity<RetirementCalculationResponse> calculateRetirementProjection(
            @PathVariable Long planId,
            Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getName());
            
            // Verify the plan belongs to the authenticated user
            Optional<RetirementPlan> planOpt = retirementPlanningService.getRetirementPlanByUserId(userId);
            if (planOpt.isEmpty() || !planOpt.get().getId().equals(planId)) {
                return ResponseEntity.notFound().build();
            }
            
            RetirementCalculationResponse calculation = retirementPlanningService.calculateRetirementProjection(planId);
            return ResponseEntity.ok(calculation);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Calculate retirement projections for the latest plan
     */
    @GetMapping("/calculate")
    public ResponseEntity<RetirementCalculationResponse> calculateLatestRetirementProjection(
            Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getName());
            Optional<RetirementPlan> planOpt = retirementPlanningService.getRetirementPlanByUserId(userId);
            
            if (planOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            RetirementCalculationResponse calculation = retirementPlanningService.calculateRetirementProjection(planOpt.get());
            return ResponseEntity.ok(calculation);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Calculate retirement projections with custom parameters (without saving)
     */
    @PostMapping("/calculate")
    public ResponseEntity<RetirementCalculationResponse> calculateRetirementProjection(
            @Valid @RequestBody RetirementPlanRequest request,
            Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getName());
            
            // Create a temporary plan for calculation without saving
            RetirementPlan tempPlan = new RetirementPlan();
            tempPlan.setCurrentAge(request.getCurrentAge());
            tempPlan.setRetirementAge(request.getRetirementAge());
            tempPlan.setCurrentAnnualIncome(request.getCurrentAnnualIncome());
            tempPlan.setDesiredReplacementRatio(request.getDesiredReplacementRatio());
            tempPlan.setCurrent401kBalance(request.getCurrent401kBalance());
            tempPlan.setCurrentIraBalance(request.getCurrentIraBalance());
            tempPlan.setOtherRetirementSavings(request.getOtherRetirementSavings());
            tempPlan.setMonthly401kContribution(request.getMonthly401kContribution());
            tempPlan.setMonthlyIraContribution(request.getMonthlyIraContribution());
            tempPlan.setEmployerMatchRate(request.getEmployerMatchRate());
            tempPlan.setEmployerMatchLimit(request.getEmployerMatchLimit());
            tempPlan.setExpectedAnnualReturn(request.getExpectedAnnualReturn());
            tempPlan.setExpectedInflationRate(request.getExpectedInflationRate());
            tempPlan.setSocialSecurityBenefit(request.getSocialSecurityBenefit());
            tempPlan.setLifeExpectancy(request.getLifeExpectancy());
            
            RetirementCalculationResponse calculation = retirementPlanningService.calculateRetirementProjection(tempPlan);
            return ResponseEntity.ok(calculation);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Delete a retirement plan
     */
    @DeleteMapping("/plan/{planId}")
    public ResponseEntity<Void> deleteRetirementPlan(
            @PathVariable Long planId,
            Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getName());
            retirementPlanningService.deleteRetirementPlan(planId, userId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get retirement readiness assessment
     */
    @GetMapping("/readiness")
    public ResponseEntity<RetirementCalculationResponse> getRetirementReadiness(Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getName());
            Optional<RetirementPlan> planOpt = retirementPlanningService.getRetirementPlanByUserId(userId);
            
            if (planOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            RetirementCalculationResponse calculation = retirementPlanningService.calculateRetirementProjection(planOpt.get());
            return ResponseEntity.ok(calculation);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}