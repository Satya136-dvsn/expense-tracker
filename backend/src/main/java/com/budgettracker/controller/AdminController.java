package com.budgettracker.controller;

import com.budgettracker.dto.AuthResponse;
import com.budgettracker.model.User;
import com.budgettracker.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userService.getAllUsers();
            
            List<AuthResponse> userResponses = users.stream()
                .map(user -> {
                    AuthResponse response = new AuthResponse();
                    response.setId(user.getId());
                    response.setUsername(user.getUsername());
                    response.setEmail(user.getEmail());
                    response.setRole(user.getRole().name());
                    response.setMonthlyIncome(user.getMonthlyIncome());
                    response.setCurrentSavings(user.getCurrentSavings());
                    response.setTargetExpenses(user.getTargetExpenses());
                    return response;
                })
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(userResponses);
            
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body("Error: " + e.getMessage());
        }
    }
    
    @GetMapping("/users/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUserById(@PathVariable Long userId) {
        try {
            User user = userService.getUserById(userId);
            
            AuthResponse response = new AuthResponse();
            response.setId(user.getId());
            response.setUsername(user.getUsername());
            response.setEmail(user.getEmail());
            response.setRole(user.getRole().name());
            response.setMonthlyIncome(user.getMonthlyIncome());
            response.setCurrentSavings(user.getCurrentSavings());
            response.setTargetExpenses(user.getTargetExpenses());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body("Error: " + e.getMessage());
        }
    }
    
    @GetMapping("/dashboard/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAdminDashboardStats() {
        try {
            List<User> users = userService.getAllUsers();
            
            long totalUsers = users.size();
            long activeUsers = users.stream()
                .filter(user -> user.getMonthlyIncome() != null && user.getMonthlyIncome().compareTo(java.math.BigDecimal.ZERO) > 0)
                .count();
            
            java.math.BigDecimal totalSavings = users.stream()
                .filter(user -> user.getCurrentSavings() != null)
                .map(User::getCurrentSavings)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
            
            java.math.BigDecimal totalIncome = users.stream()
                .filter(user -> user.getMonthlyIncome() != null)
                .map(User::getMonthlyIncome)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
            
            java.util.Map<String, Object> stats = new java.util.HashMap<>();
            stats.put("totalUsers", totalUsers);
            stats.put("activeUsers", activeUsers);
            stats.put("totalSavings", totalSavings);
            stats.put("totalMonthlyIncome", totalIncome);
            stats.put("lastUpdated", java.time.LocalDateTime.now());
            
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body("Error: " + e.getMessage());
        }
    }
}