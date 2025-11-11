package com.budgettracker.controller;

import com.budgettracker.service.MarketDataService;
import com.budgettracker.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/market-data")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", allowCredentials = "true")
public class MarketDataController {
    
    @Autowired
    private MarketDataService marketDataService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @GetMapping("/price/{symbol}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getCurrentPrice(
            @PathVariable String symbol,
            @RequestHeader("Authorization") String token) {
        try {
            jwtUtil.extractUsername(token.substring(7)); // Validate token
            BigDecimal price = marketDataService.getCurrentPrice(symbol.toUpperCase());
            
            if (price == null) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(Map.of(
                "symbol", symbol.toUpperCase(),
                "price", price
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching price: " + e.getMessage());
        }
    }
    
    @GetMapping("/quote/{symbol}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getQuote(
            @PathVariable String symbol,
            @RequestHeader("Authorization") String token) {
        try {
            jwtUtil.extractUsername(token.substring(7)); // Validate token
            Map<String, Object> quote = marketDataService.getQuote(symbol.toUpperCase());
            
            if (quote == null) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(quote);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching quote: " + e.getMessage());
        }
    }
    
    @GetMapping("/search")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> searchSymbol(
            @RequestParam String keywords,
            @RequestHeader("Authorization") String token) {
        try {
            jwtUtil.extractUsername(token.substring(7)); // Validate token
            Map<String, Object> results = marketDataService.searchSymbol(keywords);
            
            if (results == null) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error searching symbols: " + e.getMessage());
        }
    }
    
    @PostMapping("/refresh-price/{symbol}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> refreshPrice(
            @PathVariable String symbol,
            @RequestHeader("Authorization") String token) {
        try {
            jwtUtil.extractUsername(token.substring(7)); // Validate token
            
            // Evict cache and fetch fresh price
            marketDataService.evictPriceCache(symbol.toUpperCase());
            BigDecimal price = marketDataService.getCurrentPrice(symbol.toUpperCase());
            
            if (price == null) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(Map.of(
                "symbol", symbol.toUpperCase(),
                "price", price,
                "refreshed", true
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error refreshing price: " + e.getMessage());
        }
    }
}