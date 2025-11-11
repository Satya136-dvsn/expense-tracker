package com.budgettracker.controller;

import com.budgettracker.dto.UserProfileRequest;
import com.budgettracker.dto.UserProfileResponse;
import com.budgettracker.dto.UserWithProfileResponse;
import com.budgettracker.service.UserProfileService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST controller for user profile management
 * Handles user preferences, currency settings, and notification preferences
 */
@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "*")
public class UserProfileController {

    private static final Logger logger = LoggerFactory.getLogger(UserProfileController.class);

    @Autowired
    private UserProfileService userProfileService;

    /**
     * Get current user's profile
     */
    @GetMapping
    public ResponseEntity<UserWithProfileResponse> getUserProfile(Authentication authentication) {
        try {
            String username = authentication.getName();
            UserWithProfileResponse profile = userProfileService.getUserWithProfileByUsername(username);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            logger.error("Error getting user profile: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Update current user's profile
     */
    @PutMapping
    public ResponseEntity<UserProfileResponse> updateUserProfile(
            @Valid @RequestBody UserProfileRequest request,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            UserProfileResponse updatedProfile = userProfileService.updateUserProfileByUsername(username, request);
            return ResponseEntity.ok(updatedProfile);
        } catch (Exception e) {
            logger.error("Error updating user profile: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get user's preferred currency
     */
    @GetMapping("/currency")
    public ResponseEntity<Map<String, String>> getPreferredCurrency(Authentication authentication) {
        try {
            String username = authentication.getName();
            String currency = userProfileService.getUserPreferredCurrencyByUsername(username);
            return ResponseEntity.ok(Map.of("preferredCurrency", currency));
        } catch (Exception e) {
            logger.error("Error getting preferred currency: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Update user's preferred currency
     */
    @PutMapping("/currency")
    public ResponseEntity<Map<String, String>> updatePreferredCurrency(
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            String currency = request.get("currency");
            
            if (currency == null || currency.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            // Validate currency code format
            if (!currency.matches("^[A-Z]{3}$")) {
                return ResponseEntity.badRequest().build();
            }
            
            userProfileService.updateCurrencyPreferenceByUsername(username, currency);
            return ResponseEntity.ok(Map.of(
                "message", "Currency preference updated successfully",
                "preferredCurrency", currency
            ));
        } catch (Exception e) {
            logger.error("Error updating preferred currency: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get user's timezone
     */
    @GetMapping("/timezone")
    public ResponseEntity<Map<String, String>> getTimezone(Authentication authentication) {
        try {
            String username = authentication.getName();
            String timezone = userProfileService.getUserTimezoneByUsername(username);
            return ResponseEntity.ok(Map.of("timezone", timezone));
        } catch (Exception e) {
            logger.error("Error getting timezone: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Update user's theme preference
     */
    @PutMapping("/theme")
    public ResponseEntity<Map<String, String>> updateTheme(
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            String theme = request.get("theme");
            
            if (theme == null || !theme.matches("^(light|dark|auto)$")) {
                return ResponseEntity.badRequest().build();
            }
            
            UserProfileRequest profileRequest = new UserProfileRequest();
            profileRequest.setTheme(theme);
            
            userProfileService.updateUserProfileByUsername(username, profileRequest);
            return ResponseEntity.ok(Map.of(
                "message", "Theme updated successfully",
                "theme", theme
            ));
        } catch (Exception e) {
            logger.error("Error updating theme: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Update notification preferences
     */
    @PutMapping("/notifications")
    public ResponseEntity<Map<String, Object>> updateNotificationPreferences(
            @RequestBody Map<String, Boolean> request,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            
            UserProfileRequest profileRequest = new UserProfileRequest();
            
            if (request.containsKey("emailNotifications")) {
                profileRequest.setEmailNotifications(request.get("emailNotifications"));
            }
            if (request.containsKey("smsNotifications")) {
                profileRequest.setSmsNotifications(request.get("smsNotifications"));
            }
            if (request.containsKey("pushNotifications")) {
                profileRequest.setPushNotifications(request.get("pushNotifications"));
            }
            if (request.containsKey("whatsappNotifications")) {
                profileRequest.setWhatsappNotifications(request.get("whatsappNotifications"));
            }
            if (request.containsKey("budgetAlerts")) {
                profileRequest.setBudgetAlerts(request.get("budgetAlerts"));
            }
            if (request.containsKey("billReminders")) {
                profileRequest.setBillReminders(request.get("billReminders"));
            }
            if (request.containsKey("investmentAlerts")) {
                profileRequest.setInvestmentAlerts(request.get("investmentAlerts"));
            }
            if (request.containsKey("weeklySummary")) {
                profileRequest.setWeeklySummary(request.get("weeklySummary"));
            }
            if (request.containsKey("monthlyReport")) {
                profileRequest.setMonthlyReport(request.get("monthlyReport"));
            }
            
            userProfileService.updateUserProfileByUsername(username, profileRequest);
            return ResponseEntity.ok(Map.of(
                "message", "Notification preferences updated successfully",
                "preferences", request
            ));
        } catch (Exception e) {
            logger.error("Error updating notification preferences: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Reset profile to defaults (INR currency, IST timezone)
     */
    @PostMapping("/reset")
    public ResponseEntity<UserProfileResponse> resetProfile(Authentication authentication) {
        try {
            String username = authentication.getName();
            
            // Delete existing profile and create new default profile
            UserProfileResponse newProfile = userProfileService.resetUserProfileByUsername(username);
            
            return ResponseEntity.ok(newProfile);
        } catch (Exception e) {
            logger.error("Error resetting profile: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get available currencies
     */
    @GetMapping("/currencies")
    public ResponseEntity<Map<String, Object>> getAvailableCurrencies() {
        try {
            Map<String, String> currencies = Map.of(
                "INR", "Indian Rupee (₹)",
                "USD", "US Dollar ($)",
                "EUR", "Euro (€)",
                "GBP", "British Pound (£)",
                "JPY", "Japanese Yen (¥)",
                "CAD", "Canadian Dollar (C$)",
                "AUD", "Australian Dollar (A$)",
                "CHF", "Swiss Franc (CHF)",
                "CNY", "Chinese Yuan (¥)",
                "SGD", "Singapore Dollar (S$)"
            );
            
            return ResponseEntity.ok(Map.of(
                "currencies", currencies,
                "default", "INR",
                "recommended", "INR"
            ));
        } catch (Exception e) {
            logger.error("Error getting available currencies: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get available themes
     */
    @GetMapping("/themes")
    public ResponseEntity<Map<String, Object>> getAvailableThemes() {
        try {
            Map<String, String> themes = Map.of(
                "light", "Light Theme",
                "dark", "Dark Theme",
                "auto", "Auto (System)"
            );
            
            return ResponseEntity.ok(Map.of(
                "themes", themes,
                "default", "light"
            ));
        } catch (Exception e) {
            logger.error("Error getting available themes: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}