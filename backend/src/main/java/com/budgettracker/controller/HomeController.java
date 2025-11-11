package com.budgettracker.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/api")
    public ResponseEntity<Map<String, Object>> apiInfo() {
        Map<String, Object> response = new HashMap<>();
        response.put("application", "Budget Tracker Backend");
        response.put("version", "0.0.1-SNAPSHOT");
        response.put("springBootVersion", "3.5.3");
        response.put("timestamp", LocalDateTime.now());
        response.put("status", "Running");
        response.put("message", "Welcome to Budget Tracker API");
        
        Map<String, String> endpoints = new HashMap<>();
        endpoints.put("Register", "POST /api/auth/register");
        endpoints.put("Login", "POST /api/auth/login");
        endpoints.put("User Profile", "GET /api/profile (requires authentication)");
        endpoints.put("Health Check", "GET /health");
        endpoints.put("Frontend", "GET / (HTML Interface)");
        
        response.put("availableEndpoints", endpoints);
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", LocalDateTime.now());
        health.put("application", "Budget Tracker Backend");
        return ResponseEntity.ok(health);
    }
}