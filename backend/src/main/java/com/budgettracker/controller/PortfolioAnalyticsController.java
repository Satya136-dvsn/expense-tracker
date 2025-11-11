package com.budgettracker.controller;

import com.budgettracker.service.PortfolioAnalyticsService;
import com.budgettracker.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/portfolio/analytics")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", allowCredentials = "true")
public class PortfolioAnalyticsController {
    
    @Autowired
    private PortfolioAnalyticsService portfolioAnalyticsService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @GetMapping("/performance")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getPortfolioPerformance(@RequestHeader("Authorization") String token) {
        try {
            String username = jwtUtil.extractUsername(token.substring(7));
            Map<String, Object> performance = portfolioAnalyticsService.getPortfolioPerformance(username);
            return ResponseEntity.ok(performance);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving portfolio performance: " + e.getMessage());
        }
    }
    
    @GetMapping("/allocation")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getAssetAllocation(@RequestHeader("Authorization") String token) {
        try {
            String username = jwtUtil.extractUsername(token.substring(7));
            Map<String, Object> allocation = portfolioAnalyticsService.getAssetAllocation(username);
            return ResponseEntity.ok(allocation);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving asset allocation: " + e.getMessage());
        }
    }
    
    @GetMapping("/risk-metrics")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getRiskMetrics(@RequestHeader("Authorization") String token) {
        try {
            String username = jwtUtil.extractUsername(token.substring(7));
            Map<String, Object> riskMetrics = portfolioAnalyticsService.getRiskMetrics(username);
            return ResponseEntity.ok(riskMetrics);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving risk metrics: " + e.getMessage());
        }
    }
    
    @GetMapping("/benchmark")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getPerformanceBenchmark(@RequestHeader("Authorization") String token) {
        try {
            String username = jwtUtil.extractUsername(token.substring(7));
            Map<String, Object> benchmark = portfolioAnalyticsService.getPerformanceBenchmark(username);
            return ResponseEntity.ok(benchmark);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving performance benchmark: " + e.getMessage());
        }
    }
    
    @GetMapping("/top-performers")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getTopPerformers(
            @RequestParam(defaultValue = "5") int limit,
            @RequestHeader("Authorization") String token) {
        try {
            String username = jwtUtil.extractUsername(token.substring(7));
            List<Map<String, Object>> topPerformers = portfolioAnalyticsService.getTopPerformers(username, limit);
            return ResponseEntity.ok(topPerformers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving top performers: " + e.getMessage());
        }
    }
    
    @GetMapping("/worst-performers")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getWorstPerformers(
            @RequestParam(defaultValue = "5") int limit,
            @RequestHeader("Authorization") String token) {
        try {
            String username = jwtUtil.extractUsername(token.substring(7));
            List<Map<String, Object>> worstPerformers = portfolioAnalyticsService.getWorstPerformers(username, limit);
            return ResponseEntity.ok(worstPerformers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving worst performers: " + e.getMessage());
        }
    }
    
    @GetMapping("/summary")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getPortfolioSummary(@RequestHeader("Authorization") String token) {
        try {
            String username = jwtUtil.extractUsername(token.substring(7));
            Map<String, Object> summary = portfolioAnalyticsService.getPortfolioSummary(username);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving portfolio summary: " + e.getMessage());
        }
    }
}