package com.budgettracker.controller;

import com.budgettracker.service.FinancialHealthService;
import com.budgettracker.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/financial-health")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", allowCredentials = "true")
public class FinancialHealthController {
    
    @Autowired
    private FinancialHealthService financialHealthService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @GetMapping("/score")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getFinancialHealthScore(@RequestHeader("Authorization") String token) {
        try {
            String username = jwtUtil.extractUsername(token.substring(7));
            Map<String, Object> healthScore = financialHealthService.calculateFinancialHealthScore(username);
            return ResponseEntity.ok(healthScore);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error calculating financial health score: " + e.getMessage());
        }
    }
}