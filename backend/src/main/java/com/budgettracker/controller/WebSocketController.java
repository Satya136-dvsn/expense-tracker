package com.budgettracker.controller;

import com.budgettracker.service.RealTimeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Map;

/**
 * WebSocket controller for handling real-time communication
 * Manages client connections, subscriptions, and real-time data updates
 */
@Controller
public class WebSocketController {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketController.class);

    @Autowired
    private RealTimeService realTimeService;

    /**
     * Handle client connection and subscription
     */
    @MessageMapping("/connect")
    @SendTo("/topic/system")
    public Map<String, Object> handleConnect(SimpMessageHeaderAccessor headerAccessor, Principal principal) {
        String sessionId = headerAccessor.getSessionId();
        String username = principal != null ? principal.getName() : "anonymous";
        
        logger.info("WebSocket connection established - Session: {}, User: {}", sessionId, username);
        
        return Map.of(
            "type", "CONNECTION_ESTABLISHED",
            "message", "Connected to real-time updates",
            "sessionId", sessionId,
            "timestamp", System.currentTimeMillis()
        );
    }

    /**
     * Handle client ping for connection health check
     */
    @MessageMapping("/ping")
    public void handlePing(@Payload Map<String, Object> message, Principal principal) {
        if (principal != null) {
            Long userId = Long.parseLong(principal.getName());
            realTimeService.sendUserUpdate(userId, "PONG", Map.of(
                "timestamp", System.currentTimeMillis(),
                "message", "Connection active"
            ));
        }
    }

    /**
     * Handle dashboard subscription
     */
    @MessageMapping("/subscribe/dashboard")
    public void subscribeToDashboard(@Payload Map<String, Object> message, Principal principal) {
        if (principal != null) {
            Long userId = Long.parseLong(principal.getName());
            logger.info("User {} subscribed to dashboard updates", userId);
            
            // Send initial dashboard data
            realTimeService.sendDashboardRefresh(userId);
        }
    }

    /**
     * Handle transaction updates subscription
     */
    @MessageMapping("/subscribe/transactions")
    public void subscribeToTransactions(@Payload Map<String, Object> message, Principal principal) {
        if (principal != null) {
            Long userId = Long.parseLong(principal.getName());
            logger.info("User {} subscribed to transaction updates", userId);
            
            // Send confirmation
            realTimeService.sendUserUpdate(userId, "SUBSCRIPTION_CONFIRMED", Map.of(
                "type", "transactions",
                "message", "Subscribed to real-time transaction updates"
            ));
        }
    }

    /**
     * Handle analytics subscription
     */
    @MessageMapping("/subscribe/analytics")
    public void subscribeToAnalytics(@Payload Map<String, Object> message, Principal principal) {
        if (principal != null) {
            Long userId = Long.parseLong(principal.getName());
            logger.info("User {} subscribed to analytics updates", userId);
            
            // Send confirmation
            realTimeService.sendUserUpdate(userId, "SUBSCRIPTION_CONFIRMED", Map.of(
                "type", "analytics",
                "message", "Subscribed to real-time analytics updates"
            ));
        }
    }

    /**
     * Handle investment updates subscription
     */
    @MessageMapping("/subscribe/investments")
    public void subscribeToInvestments(@Payload Map<String, Object> message, Principal principal) {
        if (principal != null) {
            Long userId = Long.parseLong(principal.getName());
            logger.info("User {} subscribed to investment updates", userId);
            
            // Send confirmation
            realTimeService.sendUserUpdate(userId, "SUBSCRIPTION_CONFIRMED", Map.of(
                "type", "investments",
                "message", "Subscribed to real-time investment updates"
            ));
        }
    }

    /**
     * Handle bill reminders subscription
     */
    @MessageMapping("/subscribe/bills")
    public void subscribeToBills(@Payload Map<String, Object> message, Principal principal) {
        if (principal != null) {
            Long userId = Long.parseLong(principal.getName());
            logger.info("User {} subscribed to bill updates", userId);
            
            // Send confirmation
            realTimeService.sendUserUpdate(userId, "SUBSCRIPTION_CONFIRMED", Map.of(
                "type", "bills",
                "message", "Subscribed to real-time bill reminders"
            ));
        }
    }
}