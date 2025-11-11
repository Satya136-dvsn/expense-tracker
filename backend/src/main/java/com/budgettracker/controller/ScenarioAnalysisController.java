package com.budgettracker.controller;

import com.budgettracker.service.ScenarioAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/scenario-analysis")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ScenarioAnalysisController {
    
    @Autowired
    private ScenarioAnalysisService scenarioAnalysisService;
    
    // Perform what-if analysis
    @PostMapping("/what-if")
    public ResponseEntity<?> performWhatIfAnalysis(@RequestBody Map<String, Object> scenarios,
                                                   Authentication authentication) {
        try {
            String username = authentication.getName();
            Map<String, Object> results = scenarioAnalysisService.performWhatIfAnalysis(username, scenarios);
            return ResponseEntity.ok(results);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Perform Monte Carlo simulation
    @PostMapping("/monte-carlo")
    public ResponseEntity<?> performMonteCarloSimulation(@RequestParam(defaultValue = "1000") int numSimulations,
                                                         Authentication authentication) {
        try {
            String username = authentication.getName();
            Map<String, Object> results = scenarioAnalysisService.performMonteCarloSimulation(username, numSimulations);
            return ResponseEntity.ok(results);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Perform sensitivity analysis
    @GetMapping("/sensitivity")
    public ResponseEntity<?> performSensitivityAnalysis(Authentication authentication) {
        try {
            String username = authentication.getName();
            Map<String, Object> results = scenarioAnalysisService.performSensitivityAnalysis(username);
            return ResponseEntity.ok(results);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Create goal prioritization matrix
    @PostMapping("/goal-prioritization")
    public ResponseEntity<?> createGoalPrioritizationMatrix(@RequestBody List<Map<String, Object>> goals,
                                                            Authentication authentication) {
        try {
            String username = authentication.getName();
            Map<String, Object> results = scenarioAnalysisService.createGoalPrioritizationMatrix(username, goals);
            return ResponseEntity.ok(results);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Get sample scenarios for what-if analysis
    @GetMapping("/sample-scenarios")
    public ResponseEntity<?> getSampleScenarios() {
        Map<String, Object> sampleScenarios = Map.of(
                "optimistic", Map.of(
                        "returnRate", 0.10,
                        "contributionRate", 0.20,
                        "inflationRate", 0.02
                ),
                "pessimistic", Map.of(
                        "returnRate", 0.04,
                        "contributionRate", 0.05,
                        "inflationRate", 0.04
                ),
                "earlyRetirement", Map.of(
                        "retirementAge", 55,
                        "contributionRate", 0.25
                ),
                "lateRetirement", Map.of(
                        "retirementAge", 70,
                        "contributionRate", 0.10
                ),
                "increasedContributions", Map.of(
                        "monthly401kContribution", 2000,
                        "monthlyIraContribution", 500
                ),
                "marketCrash", Map.of(
                        "returnRate", 0.02,
                        "inflationRate", 0.05
                )
        );
        
        return ResponseEntity.ok(sampleScenarios);
    }
    
    // Get sample goals for prioritization
    @GetMapping("/sample-goals")
    public ResponseEntity<?> getSampleGoals() {
        List<Map<String, Object>> sampleGoals = List.of(
                Map.of(
                        "name", "Emergency Fund",
                        "category", "emergency_fund",
                        "amount", 15000,
                        "timelineMonths", 12,
                        "monthlyCapacity", 1500,
                        "description", "Build 6-month emergency fund"
                ),
                Map.of(
                        "name", "House Down Payment",
                        "category", "home_purchase",
                        "amount", 80000,
                        "timelineMonths", 36,
                        "monthlyCapacity", 2000,
                        "description", "Save for 20% down payment on $400k home"
                ),
                Map.of(
                        "name", "Retirement Catch-up",
                        "category", "retirement",
                        "amount", 50000,
                        "timelineMonths", 60,
                        "monthlyCapacity", 1000,
                        "description", "Increase retirement savings"
                ),
                Map.of(
                        "name", "Credit Card Debt Payoff",
                        "category", "debt_payoff",
                        "amount", 12000,
                        "timelineMonths", 18,
                        "monthlyCapacity", 800,
                        "description", "Pay off high-interest credit card debt"
                ),
                Map.of(
                        "name", "Children's Education Fund",
                        "category", "education",
                        "amount", 100000,
                        "timelineMonths", 120,
                        "monthlyCapacity", 500,
                        "description", "Save for children's college education"
                ),
                Map.of(
                        "name", "European Vacation",
                        "category", "vacation",
                        "amount", 8000,
                        "timelineMonths", 18,
                        "monthlyCapacity", 400,
                        "description", "Family vacation to Europe"
                )
        );
        
        return ResponseEntity.ok(sampleGoals);
    }
    
    // Quick scenario comparison
    @GetMapping("/quick-comparison")
    public ResponseEntity<?> getQuickComparison(@RequestParam(defaultValue = "0.07") double baseReturn,
                                                @RequestParam(defaultValue = "0.10") double optimisticReturn,
                                                @RequestParam(defaultValue = "0.04") double pessimisticReturn,
                                                Authentication authentication) {
        try {
            String username = authentication.getName();
            
            Map<String, Object> scenarios = Map.of(
                    "optimistic", Map.of("returnRate", optimisticReturn),
                    "pessimistic", Map.of("returnRate", pessimisticReturn)
            );
            
            Map<String, Object> results = scenarioAnalysisService.performWhatIfAnalysis(username, scenarios);
            
            // Simplify results for quick comparison
            Map<String, Object> quickResults = Map.of(
                    "baseScenario", results.get("baseScenario"),
                    "optimisticScenario", ((Map<String, Object>) results.get("alternativeScenarios")).get("optimistic"),
                    "pessimisticScenario", ((Map<String, Object>) results.get("alternativeScenarios")).get("pessimistic"),
                    "summary", results.get("summary")
            );
            
            return ResponseEntity.ok(quickResults);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}