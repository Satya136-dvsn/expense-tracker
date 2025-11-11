package com.budgettracker.service;

import com.budgettracker.model.Bill;
import com.budgettracker.model.Notification;
import com.budgettracker.model.NotificationPreference;
import com.budgettracker.model.User;
import com.budgettracker.repository.NotificationRepository;
import com.budgettracker.repository.NotificationPreferenceRepository;
import com.budgettracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class NotificationService {
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private NotificationPreferenceRepository notificationPreferenceRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EmailService emailService;
    
    /**
     * Create a new notification
     */
    public Notification createNotification(Long userId, Notification.NotificationType type, 
                                         String title, String message) {
        Notification notification = new Notification(userId, type, title, message);
        return notificationRepository.save(notification);
    }
    
    /**
     * Create a scheduled notification
     */
    public Notification createScheduledNotification(Long userId, Notification.NotificationType type, 
                                                  String title, String message, LocalDateTime scheduledAt) {
        Notification notification = new Notification(userId, type, title, message);
        notification.setScheduledAt(scheduledAt);
        notification.setStatus(Notification.NotificationStatus.PENDING);
        return notificationRepository.save(notification);
    }
    
    /**
     * Create a bill reminder notification
     */
    public Notification createBillReminder(Long userId, Bill bill, int daysUntilDue) {
        String title = "Bill Reminder: " + bill.getName();
        String message = String.format("Your %s bill of $%.2f is due in %d day%s (%s)", 
                                      bill.getName(), 
                                      bill.getAmount(), 
                                      daysUntilDue,
                                      daysUntilDue == 1 ? "" : "s",
                                      bill.getNextDueDate().format(DateTimeFormatter.ofPattern("MMM dd, yyyy")));
        
        Notification notification = new Notification(userId, Notification.NotificationType.BILL_REMINDER, title, message);
        notification.setRelatedEntityId(bill.getId());
        notification.setRelatedEntityType("BILL");
        notification.setPriority(daysUntilDue <= 1 ? Notification.NotificationPriority.HIGH : Notification.NotificationPriority.MEDIUM);
        notification.setActionUrl("/bills/" + bill.getId());
        notification.setActionText("View Bill");
        
        return notificationRepository.save(notification);
    }
    
    /**
     * Create an overdue bill notification
     */
    public Notification createOverdueBillNotification(Long userId, Bill bill, int daysOverdue) {
        String title = "Overdue Bill: " + bill.getName();
        String message = String.format("Your %s bill of $%.2f is %d day%s overdue! Please pay as soon as possible.", 
                                      bill.getName(), 
                                      bill.getAmount(), 
                                      daysOverdue,
                                      daysOverdue == 1 ? "" : "s");
        
        Notification notification = new Notification(userId, Notification.NotificationType.BILL_OVERDUE, title, message);
        notification.setRelatedEntityId(bill.getId());
        notification.setRelatedEntityType("BILL");
        notification.setPriority(Notification.NotificationPriority.URGENT);
        notification.setActionUrl("/bills/" + bill.getId());
        notification.setActionText("Pay Now");
        
        return notificationRepository.save(notification);
    }
    
    /**
     * Create a payment confirmation notification
     */
    public Notification createPaymentConfirmation(Long userId, Bill bill, String confirmationNumber) {
        String title = "Payment Confirmed: " + bill.getName();
        String message = String.format("Your payment of $%.2f for %s has been confirmed. Confirmation #: %s", 
                                      bill.getAmount(), 
                                      bill.getName(),
                                      confirmationNumber != null ? confirmationNumber : "N/A");
        
        Notification notification = new Notification(userId, Notification.NotificationType.PAYMENT_CONFIRMATION, title, message);
        notification.setRelatedEntityId(bill.getId());
        notification.setRelatedEntityType("BILL");
        notification.setPriority(Notification.NotificationPriority.LOW);
        notification.setActionUrl("/bills/" + bill.getId() + "/payments");
        notification.setActionText("View Payment History");
        
        return notificationRepository.save(notification);
    }
    
    /**
     * Send notification via all enabled channels
     */
    @Async
    public void sendNotification(Long notificationId) {
        Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
        if (!notificationOpt.isPresent()) {
            return;
        }
        
        Notification notification = notificationOpt.get();
        NotificationPreference preferences = getOrCreateNotificationPreferences(notification.getUserId());
        
        boolean sent = false;
        
        // Send email if enabled
        if (preferences.shouldSendEmail(notification.getType())) {
            try {
                sendEmailNotification(notification);
                notification.setEmailSent(true);
                sent = true;
            } catch (Exception e) {
                // Log error but continue with other channels
                System.err.println("Failed to send email notification: " + e.getMessage());
            }
        }
        
        // Send push notification if enabled
        if (preferences.shouldSendPush(notification.getType())) {
            try {
                sendPushNotification(notification);
                notification.setPushSent(true);
                sent = true;
            } catch (Exception e) {
                // Log error but continue
                System.err.println("Failed to send push notification: " + e.getMessage());
            }
        }
        
        // Always create in-app notification if enabled
        if (preferences.shouldSendInApp(notification.getType())) {
            sent = true;
        }
        
        // Update notification status
        if (sent) {
            notification.markAsSent();
        } else {
            notification.setStatus(Notification.NotificationStatus.FAILED);
        }
        
        notificationRepository.save(notification);
    }
    
    /**
     * Send email notification
     */
    private void sendEmailNotification(Notification notification) {
        Optional<User> userOpt = userRepository.findById(notification.getUserId());
        if (!userOpt.isPresent()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOpt.get();
        emailService.sendNotificationEmail(user.getEmail(), notification.getTitle(), 
                                         notification.getMessage(), notification.getActionUrl());
    }
    
    /**
     * Send push notification (placeholder - would integrate with FCM)
     */
    private void sendPushNotification(Notification notification) {
        // Placeholder for Firebase Cloud Messaging integration
        // In a real implementation, this would send push notifications to mobile devices
        System.out.println("Push notification sent: " + notification.getTitle());
    }
    
    /**
     * Get all notifications for a user
     */
    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    /**
     * Get unread notifications for a user
     */
    public List<Notification> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, Notification.NotificationStatus.UNREAD);
    }
    
    /**
     * Mark notification as read
     */
    public void markAsRead(Long userId, Long notificationId) {
        Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
        if (notificationOpt.isPresent()) {
            Notification notification = notificationOpt.get();
            if (notification.getUserId().equals(userId)) {
                notification.markAsRead();
                notificationRepository.save(notification);
            }
        }
    }
    
    /**
     * Mark all notifications as read for a user
     */
    public void markAllAsRead(Long userId) {
        List<Notification> unreadNotifications = getUnreadNotifications(userId);
        for (Notification notification : unreadNotifications) {
            notification.markAsRead();
        }
        notificationRepository.saveAll(unreadNotifications);
    }
    
    /**
     * Delete notification
     */
    public void deleteNotification(Long userId, Long notificationId) {
        Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
        if (notificationOpt.isPresent()) {
            Notification notification = notificationOpt.get();
            if (notification.getUserId().equals(userId)) {
                notificationRepository.delete(notification);
            }
        }
    }
    
    /**
     * Get notification preferences for a user
     */
    public NotificationPreference getNotificationPreferences(Long userId) {
        return getOrCreateNotificationPreferences(userId);
    }
    
    /**
     * Update notification preferences
     */
    public NotificationPreference updateNotificationPreferences(Long userId, NotificationPreference preferences) {
        NotificationPreference existing = getOrCreateNotificationPreferences(userId);
        
        // Update all preference fields
        existing.setEmailEnabled(preferences.getEmailEnabled());
        existing.setEmailBillReminders(preferences.getEmailBillReminders());
        existing.setEmailOverdueBills(preferences.getEmailOverdueBills());
        existing.setEmailPaymentConfirmations(preferences.getEmailPaymentConfirmations());
        existing.setEmailBudgetAlerts(preferences.getEmailBudgetAlerts());
        existing.setEmailGoalMilestones(preferences.getEmailGoalMilestones());
        
        existing.setPushEnabled(preferences.getPushEnabled());
        existing.setPushBillReminders(preferences.getPushBillReminders());
        existing.setPushOverdueBills(preferences.getPushOverdueBills());
        existing.setPushPaymentConfirmations(preferences.getPushPaymentConfirmations());
        existing.setPushBudgetAlerts(preferences.getPushBudgetAlerts());
        existing.setPushGoalMilestones(preferences.getPushGoalMilestones());
        
        existing.setInAppEnabled(preferences.getInAppEnabled());
        existing.setInAppBillReminders(preferences.getInAppBillReminders());
        existing.setInAppOverdueBills(preferences.getInAppOverdueBills());
        existing.setInAppPaymentConfirmations(preferences.getInAppPaymentConfirmations());
        existing.setInAppBudgetAlerts(preferences.getInAppBudgetAlerts());
        existing.setInAppGoalMilestones(preferences.getInAppGoalMilestones());
        
        existing.setQuietHoursStart(preferences.getQuietHoursStart());
        existing.setQuietHoursEnd(preferences.getQuietHoursEnd());
        existing.setTimezone(preferences.getTimezone());
        existing.setDigestFrequency(preferences.getDigestFrequency());
        existing.setReminderAdvanceDays(preferences.getReminderAdvanceDays());
        
        return notificationPreferenceRepository.save(existing);
    }
    
    /**
     * Count unread notifications for a user
     */
    public long getUnreadNotificationCount(Long userId) {
        return notificationRepository.countByUserIdAndStatus(userId, Notification.NotificationStatus.UNREAD);
    }
    
    /**
     * Process scheduled notifications (called by scheduler)
     */
    @Scheduled(fixedRate = 60000) // Run every minute
    public void processScheduledNotifications() {
        List<Notification> pendingNotifications = notificationRepository.findPendingNotificationsToSend(LocalDateTime.now());
        
        for (Notification notification : pendingNotifications) {
            sendNotification(notification.getId());
        }
    }
    
    /**
     * Clean up old notifications (called by scheduler)
     */
    @Scheduled(cron = "0 0 2 * * ?") // Run daily at 2 AM
    public void cleanupOldNotifications() {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(90); // Keep notifications for 90 days
        notificationRepository.deleteByCreatedAtBefore(cutoffDate);
    }
    
    /**
     * Get or create notification preferences for a user
     */
    private NotificationPreference getOrCreateNotificationPreferences(Long userId) {
        Optional<NotificationPreference> preferencesOpt = notificationPreferenceRepository.findByUserId(userId);
        
        if (preferencesOpt.isPresent()) {
            return preferencesOpt.get();
        } else {
            NotificationPreference preferences = new NotificationPreference(userId);
            return notificationPreferenceRepository.save(preferences);
        }
    }
}