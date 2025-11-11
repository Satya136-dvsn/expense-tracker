package com.budgettracker.controller;

import com.budgettracker.dto.AuthRequest;
import com.budgettracker.dto.AuthResponse;
import com.budgettracker.dto.LoginRequest;
import com.budgettracker.model.User;
import com.budgettracker.service.UserService;
import com.budgettracker.util.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody AuthRequest authRequest) {
        return registerUser(authRequest);
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AuthRequest authRequest) {
        return registerUser(authRequest);
    }
    
    private ResponseEntity<?> registerUser(AuthRequest authRequest) {
        try {
            System.out.println("Registration attempt for user: " + authRequest.getUsername());
            
            // Check if username already exists
            if (userService.existsByUsername(authRequest.getUsername())) {
                System.out.println("Username already exists: " + authRequest.getUsername());
                return ResponseEntity.badRequest()
                    .body("Error: Username is already taken!");
            }
            
            // Check if email already exists
            if (userService.existsByEmail(authRequest.getEmail())) {
                System.out.println("Email already exists: " + authRequest.getEmail());
                return ResponseEntity.badRequest()
                    .body("Error: Email is already in use!");
            }
            
            System.out.println("Creating new user...");
            // Create new user with role
            User user = new User(authRequest.getUsername(), authRequest.getEmail(), authRequest.getPassword());
            if (authRequest.getRole() != null) {
                try {
                    user.setRole(com.budgettracker.model.Role.valueOf(authRequest.getRole()));
                } catch (IllegalArgumentException ex) {
                    user.setRole(com.budgettracker.model.Role.USER);
                }
            }
            User savedUser = userService.saveUser(user);
            System.out.println("User saved successfully with ID: " + savedUser.getId());
            
            // Generate JWT token
            String token = jwtUtil.generateToken(savedUser);
            
            // Create response
            AuthResponse response = new AuthResponse(token, savedUser.getId(), 
                savedUser.getUsername(), savedUser.getEmail(), savedUser.getRole().name());
            response.setMonthlyIncome(savedUser.getMonthlyIncome());
            response.setCurrentSavings(savedUser.getCurrentSavings());
            response.setTargetExpenses(savedUser.getTargetExpenses());
            
            System.out.println("Registration successful for user: " + savedUser.getUsername());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Registration error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error: " + e.getMessage());
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            System.out.println("Login attempt for user: " + loginRequest.getUsername());
            
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getUsername(),
                    loginRequest.getPassword()
                )
            );
            
            System.out.println("Authentication successful for user: " + loginRequest.getUsername());
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            User user = (User) authentication.getPrincipal();
            String token = jwtUtil.generateToken(user);
            
            AuthResponse response = new AuthResponse(token, user.getId(), 
                user.getUsername(), user.getEmail(), user.getRole().name());
            response.setMonthlyIncome(user.getMonthlyIncome());
            response.setCurrentSavings(user.getCurrentSavings());
            response.setTargetExpenses(user.getTargetExpenses());
            
            System.out.println("Login successful for user: " + user.getUsername());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.out.println("Login failed for user: " + loginRequest.getUsername() + ", Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Error: Invalid username or password. Please check your credentials or register first.");
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok("Successfully logged out");
    }
    
    @GetMapping("/users-debug")
    public ResponseEntity<?> getUsersDebug() {
        try {
            // This is for debugging only - should be removed in production
            java.util.List<User> users = userService.getAllUsers();
            java.util.List<java.util.Map<String, Object>> userList = new java.util.ArrayList<>();
            
            for (User user : users) {
                java.util.Map<String, Object> userMap = new java.util.HashMap<>();
                userMap.put("id", user.getId());
                userMap.put("username", user.getUsername());
                userMap.put("email", user.getEmail());
                userMap.put("role", user.getRole().name());
                userMap.put("monthlyIncome", user.getMonthlyIncome());
                userMap.put("currentSavings", user.getCurrentSavings());
                userMap.put("targetExpenses", user.getTargetExpenses());
                userMap.put("createdAt", user.getCreatedAt());
                userList.add(userMap);
            }
            
            return ResponseEntity.ok(userList);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error: " + e.getMessage());
        }
    }
    
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            
            System.out.println("Password change attempt for user: " + username);
            
            Optional<User> userOptional = userService.findByUsername(username);
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("User not found");
            }
            
            User user = userOptional.get();
            
            // Verify current password
            if (!userService.verifyPassword(user.getUsername(), request.getCurrentPassword())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Current password is incorrect");
            }
            
            // Update password
            userService.changePassword(user.getUsername(), request.getNewPassword());
            
            System.out.println("Password changed successfully for user: " + username);
            return ResponseEntity.ok("Password changed successfully");
            
        } catch (Exception e) {
            System.err.println("Password change error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error changing password: " + e.getMessage());
        }
    }
    
    // Inner class for change password request
    public static class ChangePasswordRequest {
        private String currentPassword;
        private String newPassword;
        
        public String getCurrentPassword() {
            return currentPassword;
        }
        
        public void setCurrentPassword(String currentPassword) {
            this.currentPassword = currentPassword;
        }
        
        public String getNewPassword() {
            return newPassword;
        }
        
        public void setNewPassword(String newPassword) {
            this.newPassword = newPassword;
        }
    }
}
