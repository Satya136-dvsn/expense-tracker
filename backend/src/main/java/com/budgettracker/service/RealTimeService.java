package com.budgettracker.service;

import com.budgettracker.dto.RealTimeUpdateDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Service for handling real-time data updates via WebSocket
 * Manages live notifications, dashboard updates, and data synchronization
 */
@Service
public class RealTimeService {

    private static final Logger logger = LoggerFactory.getLogger(RealTimeService.class);

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Send real-time update to specific user
     */
    public void sendUserUpdate(Long userId, String type, Object data) {
        try {
            RealTimeUpdateDTO update = new RealTimeUpdateDTO();
            update.setType(type);
            update.setData(data);
            update.setTimestamp(LocalDateTime.now());
            update.setUserId(userId);

            // Send to user-specific queue
            messagingTemplate.convertAndSendToUser(
                userId.toString(), 
                "/queue/updates", 
                update
            );

            logger.info("Sent real-time update to user {}: {}", userId, type);
        } catch (Exception e) {
            logger.error("Error sending real-time update to user {}: {}", userId, e.getMessage());
        }
    }

    /**
     * Send transaction update notification
     */
    public void sendTransactionUpdate(Long userId, Object transactionData) {
        sendUserUpdate(userId, "TRANSACTION_UPDATE", transactionData);
    }

    /**
     * Send balance update notification
     */
    public void sendBalanceUpdate(Long userId, Object balanceData) {
        sendUserUpdate(userId, "BALANCE_UPDATE", balanceData);
    }

    /**
     * Send budget alert notification
     */
    public void sendBudgetAlert(Long userId, Object alertData) {
        sendUserUpdate(userId, "BUDGET_ALERT", alertData);
    }

    /**
     * Send bill reminder notification
     */
    public void sendBillReminder(Long userId, Object billData) {
        sendUserUpdate(userId, "BILL_REMINDER", billData);
    }

    /**
     * Send investment update notification
     */
    public void sendInvestmentUpdate(Long userId, Object investmentData) {
        sendUserUpdate(userId, "INVESTMENT_UPDATE", investmentData);
    }

    /**
     * Send dashboard refresh signal
     */
    public void sendDashboardRefresh(Long userId) {
        sendUserUpdate(userId, "DASHBOARD_REFRESH", Map.of("refresh", true));
    }

    /**
     * Send analytics update notification
     */
    public void sendAnalyticsUpdate(Long userId, Object analyticsData) {
        sendUserUpdate(userId, "ANALYTICS_UPDATE", analyticsData);
    }

    /**
     * Send currency rate update notification
     */
    public void sendCurrencyRateUpdate(Long userId, Object rateData) {
        sendUserUpdate(userId, "CURRENCY_RATE_UPDATE", rateData);
    }

    /**
     * Send general notification
     */
    public void sendNotification(Long userId, String title, String message, String priority) {
        Map<String, Object> notificationData = Map.of(
            "title", title,
            "message", message,
            "priority", priority,
            "timestamp", LocalDateTime.now()
        );
        sendUserUpdate(userId, "NOTIFICATION", notificationData);
    }

    /**
     * Broadcast system-wide update (e.g., maintenance, new features)
     */
    public void broadcastSystemUpdate(String type, Object data) {
        try {
            RealTimeUpdateDTO update = new RealTimeUpdateDTO();
            update.setType(type);
            update.setData(data);
            update.setTimestamp(LocalDateTime.now());

            // Broadcast to all connected clients
            messagingTemplate.convertAndSend("/topic/system", update);

            logger.info("Broadcasted system update: {}", type);
        } catch (Exception e) {
            logger.error("Error broadcasting system update: {}", e.getMessage());
        }
    }
}