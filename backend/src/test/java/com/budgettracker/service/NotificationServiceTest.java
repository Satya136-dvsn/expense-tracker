package com.budgettracker.service;

import com.budgettracker.model.Bill;
import com.budgettracker.model.Notification;
import com.budgettracker.model.NotificationPreference;
import com.budgettracker.model.User;
import com.budgettracker.repository.NotificationRepository;
import com.budgettracker.repository.NotificationPreferenceRepository;
import com.budgettracker.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private NotificationPreferenceRepository notificationPreferenceRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private NotificationService notificationService;

    private Notification testNotification;
    private NotificationPreference testPreferences;
    private User testUser;
    private Bill testBill;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");
        testUser.setUsername("testuser");

        testNotification = new Notification();
        testNotification.setId(1L);
        testNotification.setUserId(1L);
        testNotification.setType(Notification.NotificationType.BILL_REMINDER);
        testNotification.setTitle("Bill Reminder");
        testNotification.setMessage("Your electric bill is due in 3 days");
        testNotification.setStatus(Notification.NotificationStatus.UNREAD);
        testNotification.setPriority(Notification.NotificationPriority.MEDIUM);

        testPreferences = new NotificationPreference();
        testPreferences.setId(1L);
        testPreferences.setUserId(1L);
        testPreferences.setEmailEnabled(true);
        testPreferences.setEmailBillReminders(true);
        testPreferences.setPushEnabled(true);
        testPreferences.setPushBillReminders(true);
        testPreferences.setInAppEnabled(true);
        testPreferences.setInAppBillReminders(true);

        testBill = new Bill();
        testBill.setId(1L);
        testBill.setUserId(1L);
        testBill.setName("Electric Bill");
        testBill.setAmount(new BigDecimal("150.00"));
        testBill.setNextDueDate(LocalDate.now().plusDays(3));
    }

    @Test
    void createNotification_ShouldCreateAndReturnNotification() {
        // Arrange
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        // Act
        Notification result = notificationService.createNotification(
            1L, Notification.NotificationType.BILL_REMINDER, "Test Title", "Test Message");

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getUserId());
        assertEquals(Notification.NotificationType.BILL_REMINDER, result.getType());
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void createScheduledNotification_ShouldCreateScheduledNotification() {
        // Arrange
        LocalDateTime scheduledTime = LocalDateTime.now().plusHours(1);
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        // Act
        Notification result = notificationService.createScheduledNotification(
            1L, Notification.NotificationType.BILL_REMINDER, "Test Title", "Test Message", scheduledTime);

        // Assert
        assertNotNull(result);
        assertEquals(Notification.NotificationStatus.PENDING, result.getStatus());
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void createBillReminder_ShouldCreateBillReminderNotification() {
        // Arrange
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        // Act
        Notification result = notificationService.createBillReminder(1L, testBill, 3);

        // Assert
        assertNotNull(result);
        assertEquals(Notification.NotificationType.BILL_REMINDER, result.getType());
        assertTrue(result.getTitle().contains("Electric Bill"));
        assertTrue(result.getMessage().contains("3 day"));
        assertEquals(testBill.getId(), result.getRelatedEntityId());
        assertEquals("BILL", result.getRelatedEntityType());
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void createBillReminder_ShouldSetHighPriorityForDueTodayBills() {
        // Arrange
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        // Act
        Notification result = notificationService.createBillReminder(1L, testBill, 0);

        // Assert
        assertNotNull(result);
        assertEquals(Notification.NotificationPriority.HIGH, result.getPriority());
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void createOverdueBillNotification_ShouldCreateOverdueNotification() {
        // Arrange
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        // Act
        Notification result = notificationService.createOverdueBillNotification(1L, testBill, 2);

        // Assert
        assertNotNull(result);
        assertEquals(Notification.NotificationType.BILL_OVERDUE, result.getType());
        assertEquals(Notification.NotificationPriority.URGENT, result.getPriority());
        assertTrue(result.getTitle().contains("Overdue"));
        assertTrue(result.getMessage().contains("2 day"));
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void createPaymentConfirmation_ShouldCreateConfirmationNotification() {
        // Arrange
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        // Act
        Notification result = notificationService.createPaymentConfirmation(1L, testBill, "CONF123");

        // Assert
        assertNotNull(result);
        assertEquals(Notification.NotificationType.PAYMENT_CONFIRMATION, result.getType());
        assertEquals(Notification.NotificationPriority.LOW, result.getPriority());
        assertTrue(result.getMessage().contains("CONF123"));
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void sendNotification_ShouldSendViaAllEnabledChannels() {
        // Arrange
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(testNotification));
        when(notificationPreferenceRepository.findByUserId(1L)).thenReturn(Optional.of(testPreferences));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        // Act
        notificationService.sendNotification(1L);

        // Assert
        verify(notificationRepository).findById(1L);
        verify(emailService).sendNotificationEmail(eq("test@example.com"), anyString(), anyString(), anyString());
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void sendNotification_ShouldNotSendWhenChannelsDisabled() {
        // Arrange
        testPreferences.setEmailEnabled(false);
        testPreferences.setPushEnabled(false);
        testPreferences.setInAppEnabled(false);
        
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(testNotification));
        when(notificationPreferenceRepository.findByUserId(1L)).thenReturn(Optional.of(testPreferences));
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        // Act
        notificationService.sendNotification(1L);

        // Assert
        verify(emailService, never()).sendNotificationEmail(anyString(), anyString(), anyString(), anyString());
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void sendNotification_ShouldNotSendEmailWhenBillRemindersDisabled() {
        // Arrange
        testPreferences.setEmailBillReminders(false);
        
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(testNotification));
        when(notificationPreferenceRepository.findByUserId(1L)).thenReturn(Optional.of(testPreferences));
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        // Act
        notificationService.sendNotification(1L);

        // Assert
        verify(emailService, never()).sendNotificationEmail(anyString(), anyString(), anyString(), anyString());
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void getUserNotifications_ShouldReturnUserNotifications() {
        // Arrange
        List<Notification> notifications = Arrays.asList(testNotification);
        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(notifications);

        // Act
        List<Notification> result = notificationService.getUserNotifications(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testNotification.getId(), result.get(0).getId());
        verify(notificationRepository).findByUserIdOrderByCreatedAtDesc(1L);
    }

    @Test
    void getUnreadNotifications_ShouldReturnUnreadNotifications() {
        // Arrange
        List<Notification> notifications = Arrays.asList(testNotification);
        when(notificationRepository.findByUserIdAndStatusOrderByCreatedAtDesc(1L, Notification.NotificationStatus.UNREAD))
            .thenReturn(notifications);

        // Act
        List<Notification> result = notificationService.getUnreadNotifications(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(Notification.NotificationStatus.UNREAD, result.get(0).getStatus());
        verify(notificationRepository).findByUserIdAndStatusOrderByCreatedAtDesc(1L, Notification.NotificationStatus.UNREAD);
    }

    @Test
    void markAsRead_ShouldMarkNotificationAsRead() {
        // Arrange
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(testNotification));
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        // Act
        notificationService.markAsRead(1L, 1L);

        // Assert
        verify(notificationRepository).findById(1L);
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void markAsRead_ShouldNotMarkWhenUnauthorized() {
        // Arrange
        testNotification.setUserId(2L); // Different user
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(testNotification));

        // Act
        notificationService.markAsRead(1L, 1L);

        // Assert
        verify(notificationRepository).findById(1L);
        verify(notificationRepository, never()).save(any(Notification.class));
    }

    @Test
    void markAllAsRead_ShouldMarkAllNotificationsAsRead() {
        // Arrange
        List<Notification> notifications = Arrays.asList(testNotification);
        when(notificationRepository.findByUserIdAndStatusOrderByCreatedAtDesc(1L, Notification.NotificationStatus.UNREAD))
            .thenReturn(notifications);
        when(notificationRepository.saveAll(anyList())).thenReturn(notifications);

        // Act
        notificationService.markAllAsRead(1L);

        // Assert
        verify(notificationRepository).findByUserIdAndStatusOrderByCreatedAtDesc(1L, Notification.NotificationStatus.UNREAD);
        verify(notificationRepository).saveAll(anyList());
    }

    @Test
    void deleteNotification_ShouldDeleteNotification() {
        // Arrange
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(testNotification));

        // Act
        notificationService.deleteNotification(1L, 1L);

        // Assert
        verify(notificationRepository).findById(1L);
        verify(notificationRepository).delete(testNotification);
    }

    @Test
    void deleteNotification_ShouldNotDeleteWhenUnauthorized() {
        // Arrange
        testNotification.setUserId(2L); // Different user
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(testNotification));

        // Act
        notificationService.deleteNotification(1L, 1L);

        // Assert
        verify(notificationRepository).findById(1L);
        verify(notificationRepository, never()).delete(any(Notification.class));
    }

    @Test
    void getNotificationPreferences_ShouldReturnPreferences() {
        // Arrange
        when(notificationPreferenceRepository.findByUserId(1L)).thenReturn(Optional.of(testPreferences));

        // Act
        NotificationPreference result = notificationService.getNotificationPreferences(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getUserId());
        assertTrue(result.getEmailEnabled());
        verify(notificationPreferenceRepository).findByUserId(1L);
    }

    @Test
    void getNotificationPreferences_ShouldCreateDefaultWhenNotExists() {
        // Arrange
        when(notificationPreferenceRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(notificationPreferenceRepository.save(any(NotificationPreference.class))).thenReturn(testPreferences);

        // Act
        NotificationPreference result = notificationService.getNotificationPreferences(1L);

        // Assert
        assertNotNull(result);
        verify(notificationPreferenceRepository).findByUserId(1L);
        verify(notificationPreferenceRepository).save(any(NotificationPreference.class));
    }

    @Test
    void updateNotificationPreferences_ShouldUpdatePreferences() {
        // Arrange
        NotificationPreference updatedPreferences = new NotificationPreference();
        updatedPreferences.setEmailEnabled(false);
        updatedPreferences.setPushEnabled(false);
        
        when(notificationPreferenceRepository.findByUserId(1L)).thenReturn(Optional.of(testPreferences));
        when(notificationPreferenceRepository.save(any(NotificationPreference.class))).thenReturn(testPreferences);

        // Act
        NotificationPreference result = notificationService.updateNotificationPreferences(1L, updatedPreferences);

        // Assert
        assertNotNull(result);
        verify(notificationPreferenceRepository).findByUserId(1L);
        verify(notificationPreferenceRepository).save(any(NotificationPreference.class));
    }

    @Test
    void getUnreadNotificationCount_ShouldReturnCount() {
        // Arrange
        when(notificationRepository.countByUserIdAndStatus(1L, Notification.NotificationStatus.UNREAD))
            .thenReturn(5L);

        // Act
        long result = notificationService.getUnreadNotificationCount(1L);

        // Assert
        assertEquals(5L, result);
        verify(notificationRepository).countByUserIdAndStatus(1L, Notification.NotificationStatus.UNREAD);
    }

    @Test
    void processScheduledNotifications_ShouldProcessPendingNotifications() {
        // Arrange
        testNotification.setStatus(Notification.NotificationStatus.PENDING);
        testNotification.setScheduledAt(LocalDateTime.now().minusMinutes(5));
        List<Notification> pendingNotifications = Arrays.asList(testNotification);
        
        when(notificationRepository.findPendingNotificationsToSend(any(LocalDateTime.class)))
            .thenReturn(pendingNotifications);
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(testNotification));
        when(notificationPreferenceRepository.findByUserId(1L)).thenReturn(Optional.of(testPreferences));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        // Act
        notificationService.processScheduledNotifications();

        // Assert
        verify(notificationRepository).findPendingNotificationsToSend(any(LocalDateTime.class));
        verify(emailService).sendNotificationEmail(anyString(), anyString(), anyString(), anyString());
    }

    @Test
    void cleanupOldNotifications_ShouldDeleteOldNotifications() {
        // Act
        notificationService.cleanupOldNotifications();

        // Assert
        verify(notificationRepository).deleteByCreatedAtBefore(any(LocalDateTime.class));
    }

    @Test
    void notificationPreference_ShouldSendEmailBasedOnType() {
        // Test bill reminder preference
        assertTrue(testPreferences.shouldSendEmail(Notification.NotificationType.BILL_REMINDER));
        
        // Test when bill reminders are disabled
        testPreferences.setEmailBillReminders(false);
        assertFalse(testPreferences.shouldSendEmail(Notification.NotificationType.BILL_REMINDER));
        
        // Test when email is completely disabled
        testPreferences.setEmailEnabled(false);
        assertFalse(testPreferences.shouldSendEmail(Notification.NotificationType.BILL_REMINDER));
    }

    @Test
    void notificationPreference_ShouldSendPushBasedOnType() {
        // Test bill reminder preference
        assertTrue(testPreferences.shouldSendPush(Notification.NotificationType.BILL_REMINDER));
        
        // Test when bill reminders are disabled
        testPreferences.setPushBillReminders(false);
        assertFalse(testPreferences.shouldSendPush(Notification.NotificationType.BILL_REMINDER));
        
        // Test when push is completely disabled
        testPreferences.setPushEnabled(false);
        assertFalse(testPreferences.shouldSendPush(Notification.NotificationType.BILL_REMINDER));
    }

    @Test
    void notificationPreference_ShouldSendInAppBasedOnType() {
        // Test bill reminder preference
        assertTrue(testPreferences.shouldSendInApp(Notification.NotificationType.BILL_REMINDER));
        
        // Test when bill reminders are disabled
        testPreferences.setInAppBillReminders(false);
        assertFalse(testPreferences.shouldSendInApp(Notification.NotificationType.BILL_REMINDER));
        
        // Test when in-app is completely disabled
        testPreferences.setInAppEnabled(false);
        assertFalse(testPreferences.shouldSendInApp(Notification.NotificationType.BILL_REMINDER));
    }
}