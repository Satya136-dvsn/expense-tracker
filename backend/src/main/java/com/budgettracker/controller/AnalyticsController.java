package com.budgettracker.controller;

import com.budgettracker.service.AnalyticsService;
import com.budgettracker.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", allowCredentials = "true")
public class AnalyticsController {
    
    @Autowired
    private AnalyticsService analyticsService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    // Get monthly trends analysis
    @GetMapping("/monthly-trends")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getMonthlyTrends(
            @RequestParam(defaultValue = "6") int months,
            @RequestHeader("Authorization") String token) {
        try {
            String username = jwtUtil.extractUsername(token.substring(7));
            Map<String, Object> trends = analyticsService.getMonthlyTrends(months, username);
            return ResponseEntity.ok(trends);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching monthly trends: " + e.getMessage());
        }
    }
    
    // Get category breakdown analysis
    @GetMapping("/category-breakdown")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getCategoryBreakdown(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestHeader("Authorization") String token) {
        try {
            String username = jwtUtil.extractUsername(token.substring(7));
            
            // Default to last 3 months if no dates provided
            if (start == null) {
                start = LocalDateTime.now().minusMonths(3);
            }
            if (end == null) {
                end = LocalDateTime.now();
            }
            
            Map<String, Object> breakdown = analyticsService.getCategoryBreakdown(username, start, end);
            return ResponseEntity.ok(breakdown);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching category breakdown: " + e.getMessage());
        }
    }
    
    // Get financial health score
    @GetMapping("/financial-health")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getFinancialHealth(@RequestHeader("Authorization") String token) {
        try {
            String username = jwtUtil.extractUsername(token.substring(7));
            Map<String, Object> health = analyticsService.calculateFinancialHealth(username);
            return ResponseEntity.ok(health);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error calculating financial health: " + e.getMessage());
        }
    }
    
    // Get budget analysis
    @GetMapping("/budget-analysis")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getBudgetAnalysis(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            @RequestHeader("Authorization") String token) {
        try {
            String username = jwtUtil.extractUsername(token.substring(7));
            
            // Default to current month/year if not provided
            LocalDateTime now = LocalDateTime.now();
            if (month == null) {
                month = now.getMonthValue();
            }
            if (year == null) {
                year = now.getYear();
            }
            
            Map<String, Object> analysis = analyticsService.getBudgetAnalysis(username, month, year);
            return ResponseEntity.ok(analysis);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching budget analysis: " + e.getMessage());
        }
    }
    
    // Get savings progress analysis
    @GetMapping("/savings-progress")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getSavingsProgress(@RequestHeader("Authorization") String token) {
        try {
            String username = jwtUtil.extractUsername(token.substring(7));
            Map<String, Object> progress = analyticsService.getSavingsProgress(username);
            return ResponseEntity.ok(progress);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching savings progress: " + e.getMessage());
        }
    }
    
    // Get comprehensive analytics dashboard data
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getAnalyticsDashboard(
            @RequestParam(defaultValue = "6") int months,
            @RequestHeader("Authorization") String token) {
        try {
            String username = jwtUtil.extractUsername(token.substring(7));
            
            // Get all analytics data in one call for dashboard
            Map<String, Object> dashboard = Map.of(
                "monthlyTrends", analyticsService.getMonthlyTrends(months, username),
                "categoryBreakdown", analyticsService.getCategoryBreakdown(username, 
                    LocalDateTime.now().minusMonths(3), LocalDateTime.now()),
                "financialHealth", analyticsService.calculateFinancialHealth(username),
                "budgetAnalysis", analyticsService.getBudgetAnalysis(username, 
                    LocalDateTime.now().getMonthValue(), LocalDateTime.now().getYear()),
                "savingsProgress", analyticsService.getSavingsProgress(username)
            );
            
            return ResponseEntity.ok(dashboard);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching analytics dashboard: " + e.getMessage());
        }
    }
    
    // Get analytics summary for quick overview
    @GetMapping("/summary")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getAnalyticsSummary(@RequestHeader("Authorization") String token) {
        try {
            String username = jwtUtil.extractUsername(token.substring(7));
            
            // Get key metrics for summary view
            Map<String, Object> monthlyTrends = analyticsService.getMonthlyTrends(3, username);
            Map<String, Object> financialHealth = analyticsService.calculateFinancialHealth(username);
            Map<String, Object> savingsProgress = analyticsService.getSavingsProgress(username);
            
            Map<String, Object> summary = Map.of(
                "healthScore", financialHealth.get("healthScore"),
                "healthTrend", financialHealth.get("healthTrend"),
                "averageIncome", monthlyTrends.get("averageIncome"),
                "averageExpenses", monthlyTrends.get("averageExpenses"),
                "trendDirection", monthlyTrends.get("trendDirection"),
                "totalGoals", savingsProgress.get("totalGoals"),
                "completedGoals", savingsProgress.get("completedGoals"),
                "overallProgressPercent", savingsProgress.get("overallProgressPercent")
            );
            
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching analytics summary: " + e.getMessage());
        }
    }
}