package com.budgettracker.controller;

import com.budgettracker.model.Notification;
import com.budgettracker.model.NotificationPreference;
import com.budgettracker.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {
    
    @Autowired
    private NotificationService notificationService;
    
    /**
     * Get all notifications for the authenticated user
     */
    @GetMapping
    public ResponseEntity<List<Notification>> getUserNotifications(Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getName());
            List<Notification> notifications = notificationService.getUserNotifications(userId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get unread notifications for the authenticated user
     */
    @GetMapping("/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getName());
            List<Notification> notifications = notificationService.getUnreadNotifications(userId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get unread notification count
     */
    @GetMapping("/unread/count")
    public ResponseEntity<Long> getUnreadNotificationCount(Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getName());
            long count = notificationService.getUnreadNotificationCount(userId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Mark a notification as read
     */
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long notificationId, 
                                          Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getName());
            notificationService.markAsRead(userId, notificationId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Mark all notifications as read
     */
    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getName());
            notificationService.markAllAsRead(userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Delete a notification
     */
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long notificationId, 
                                                   Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getName());
            notificationService.deleteNotification(userId, notificationId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get notification preferences
     */
    @GetMapping("/preferences")
    public ResponseEntity<NotificationPreference> getNotificationPreferences(Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getName());
            NotificationPreference preferences = notificationService.getNotificationPreferences(userId);
            return ResponseEntity.ok(preferences);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Update notification preferences
     */
    @PutMapping("/preferences")
    public ResponseEntity<NotificationPreference> updateNotificationPreferences(
            @RequestBody NotificationPreference preferences, 
            Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getName());
            NotificationPreference updatedPreferences = notificationService.updateNotificationPreferences(userId, preferences);
            return ResponseEntity.ok(updatedPreferences);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    /**
     * Test notification endpoint (for development/testing)
     */
    @PostMapping("/test")
    public ResponseEntity<Notification> createTestNotification(@RequestParam(defaultValue = "Test Notification") String title,
                                                              @RequestParam(defaultValue = "This is a test notification") String message,
                                                              Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getName());
            Notification notification = notificationService.createNotification(
                userId, Notification.NotificationType.SYSTEM_NOTIFICATION, title, message);
            
            // Send the notification immediately
            notificationService.sendNotification(notification.getId());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(notification);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}