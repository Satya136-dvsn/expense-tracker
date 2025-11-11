package com.budgettracker.controller;

import com.budgettracker.dto.InvestmentRequest;
import com.budgettracker.dto.InvestmentResponse;
import com.budgettracker.model.Investment.InvestmentType;
import com.budgettracker.service.InvestmentService;
import com.budgettracker.util.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/investments")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", allowCredentials = "true")
public class InvestmentController {
    
    @Autowired
    private InvestmentService investmentService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getAllInvestments(@RequestHeader("Authorization") String token) {
        try {
            String username = jwtUtil.extractUsername(token.substring(7));
            List<InvestmentResponse> investments = investmentService.getAllInvestments(username);
            return ResponseEntity.ok(investments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving investments: " + e.getMessage());
        }
    }
    
    @GetMapping("/type/{type}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getInvestmentsByType(
            @PathVariable InvestmentType type,
            @RequestHeader("Authorization") String token) {
        try {
            String username = jwtUtil.extractUsername(token.substring(7));
            List<InvestmentResponse> investments = investmentService.getInvestmentsByType(username, type);
            return ResponseEntity.ok(investments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving investments by type: " + e.getMessage());
        }
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getInvestmentById(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        try {
            String username = jwtUtil.extractUsername(token.substring(7));
            InvestmentResponse investment = investmentService.getInvestmentById(username, id);
            return ResponseEntity.ok(investment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving investment: " + e.getMessage());
        }
    }
    
    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> createInvestment(
            @Valid @RequestBody InvestmentRequest request,
            @RequestHeader("Authorization") String token) {
        try {
            String username = jwtUtil.extractUsername(token.substring(7));
            InvestmentResponse investment = investmentService.createInvestment(username, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(investment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating investment: " + e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateInvestment(
            @PathVariable Long id,
            @Valid @RequestBody InvestmentRequest request,
            @RequestHeader("Authorization") String token) {
        try {
            String username = jwtUtil.extractUsername(token.substring(7));
            InvestmentResponse investment = investmentService.updateInvestment(username, id, request);
            return ResponseEntity.ok(investment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating investment: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteInvestment(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        try {
            String username = jwtUtil.extractUsername(token.substring(7));
            investmentService.deleteInvestment(username, id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting investment: " + e.getMessage());
        }
    }
    
    @GetMapping("/portfolio/summary")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getPortfolioSummary(@RequestHeader("Authorization") String token) {
        try {
            String username = jwtUtil.extractUsername(token.substring(7));
            
            Map<String, Object> summary = new HashMap<>();
            summary.put("totalValue", investmentService.getTotalPortfolioValue(username));
            summary.put("totalCostBasis", investmentService.getTotalCostBasis(username));
            summary.put("allocation", investmentService.getPortfolioAllocation(username));
            
            BigDecimal totalValue = investmentService.getTotalPortfolioValue(username);
            BigDecimal totalCost = investmentService.getTotalCostBasis(username);
            
            if (totalCost.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal totalGainLoss = totalValue.subtract(totalCost);
                BigDecimal totalGainLossPercentage = totalGainLoss.divide(totalCost, 4, java.math.RoundingMode.HALF_UP)
                        .multiply(new BigDecimal("100"));
                summary.put("totalGainLoss", totalGainLoss);
                summary.put("totalGainLossPercentage", totalGainLossPercentage);
            } else {
                summary.put("totalGainLoss", BigDecimal.ZERO);
                summary.put("totalGainLossPercentage", BigDecimal.ZERO);
            }
            
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving portfolio summary: " + e.getMessage());
        }
    }
    
    @GetMapping("/date-range")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getInvestmentsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestHeader("Authorization") String token) {
        try {
            String username = jwtUtil.extractUsername(token.substring(7));
            List<InvestmentResponse> investments = investmentService.getInvestmentsByDateRange(username, startDate, endDate);
            return ResponseEntity.ok(investments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving investments by date range: " + e.getMessage());
        }
    }
    
    @GetMapping("/performance/top")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getTopPerformingInvestments(
            @RequestParam(defaultValue = "5") int limit,
            @RequestHeader("Authorization") String token) {
        try {
            String username = jwtUtil.extractUsername(token.substring(7));
            List<InvestmentResponse> investments = investmentService.getTopPerformingInvestments(username, limit);
            return ResponseEntity.ok(investments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving top performing investments: " + e.getMessage());
        }
    }
    
    @GetMapping("/performance/worst")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getWorstPerformingInvestments(
            @RequestParam(defaultValue = "5") int limit,
            @RequestHeader("Authorization") String token) {
        try {
            String username = jwtUtil.extractUsername(token.substring(7));
            List<InvestmentResponse> investments = investmentService.getWorstPerformingInvestments(username, limit);
            return ResponseEntity.ok(investments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving worst performing investments: " + e.getMessage());
        }
    }
    
    @GetMapping("/brokerages")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getUserBrokerages(@RequestHeader("Authorization") String token) {
        try {
            String username = jwtUtil.extractUsername(token.substring(7));
            List<String> brokerages = investmentService.getUserBrokerages(username);
            return ResponseEntity.ok(brokerages);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving user brokerages: " + e.getMessage());
        }
    }
    
    @GetMapping("/symbols")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getUserSymbols(@RequestHeader("Authorization") String token) {
        try {
            String username = jwtUtil.extractUsername(token.substring(7));
            List<String> symbols = investmentService.getUserSymbols(username);
            return ResponseEntity.ok(symbols);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving user symbols: " + e.getMessage());
        }
    }
    
    @PostMapping("/{id}/refresh-price")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> refreshInvestmentPrice(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        try {
            String username = jwtUtil.extractUsername(token.substring(7));
            investmentService.refreshInvestmentPrice(username, id);
            return ResponseEntity.ok(Map.of("message", "Price refresh initiated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error refreshing investment price: " + e.getMessage());
        }
    }
    
    @PostMapping("/refresh-all-prices")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> refreshAllInvestmentPrices(@RequestHeader("Authorization") String token) {
        try {
            String username = jwtUtil.extractUsername(token.substring(7));
            investmentService.refreshAllUserInvestmentPrices(username);
            return ResponseEntity.ok(Map.of("message", "Price refresh for all investments initiated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error refreshing all investment prices: " + e.getMessage());
        }
    }
}