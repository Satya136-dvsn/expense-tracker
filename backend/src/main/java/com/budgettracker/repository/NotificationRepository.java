package com.budgettracker.repository;

import com.budgettracker.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    /**
     * Find all notifications for a user ordered by creation date (newest first)
     */
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    /**
     * Find unread notifications for a user
     */
    List<Notification> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, Notification.NotificationStatus status);
    
    /**
     * Find notifications by type for a user
     */
    List<Notification> findByUserIdAndTypeOrderByCreatedAtDesc(Long userId, Notification.NotificationType type);
    
    /**
     * Find notifications by priority for a user
     */
    List<Notification> findByUserIdAndPriorityOrderByCreatedAtDesc(Long userId, Notification.NotificationPriority priority);
    
    /**
     * Find pending notifications that are scheduled to be sent
     */
    @Query("SELECT n FROM Notification n WHERE n.status = 'PENDING' AND n.scheduledAt <= :now ORDER BY n.scheduledAt ASC")
    List<Notification> findPendingNotificationsToSend(@Param("now") LocalDateTime now);
    
    /**
     * Find notifications scheduled for a specific time range
     */
    @Query("SELECT n FROM Notification n WHERE n.userId = :userId AND n.scheduledAt BETWEEN :startTime AND :endTime ORDER BY n.scheduledAt ASC")
    List<Notification> findScheduledNotificationsInRange(@Param("userId") Long userId, 
                                                         @Param("startTime") LocalDateTime startTime, 
                                                         @Param("endTime") LocalDateTime endTime);
    
    /**
     * Find notifications related to a specific entity
     */
    List<Notification> findByUserIdAndRelatedEntityIdAndRelatedEntityTypeOrderByCreatedAtDesc(
        Long userId, Long relatedEntityId, String relatedEntityType);
    
    /**
     * Count unread notifications for a user
     */
    long countByUserIdAndStatus(Long userId, Notification.NotificationStatus status);
    
    /**
     * Count notifications by type for a user
     */
    long countByUserIdAndType(Long userId, Notification.NotificationType type);
    
    /**
     * Find recent notifications (within last N days)
     */
    @Query("SELECT n FROM Notification n WHERE n.userId = :userId AND n.createdAt >= :since ORDER BY n.createdAt DESC")
    List<Notification> findRecentNotifications(@Param("userId") Long userId, @Param("since") LocalDateTime since);
    
    /**
     * Find failed notifications that need retry
     */
    @Query("SELECT n FROM Notification n WHERE n.status = 'FAILED' AND n.createdAt >= :since ORDER BY n.createdAt ASC")
    List<Notification> findFailedNotificationsForRetry(@Param("since") LocalDateTime since);
    
    /**
     * Find notifications that haven't been sent via email
     */
    @Query("SELECT n FROM Notification n WHERE n.userId = :userId AND n.emailSent = false AND n.status IN ('PENDING', 'SENT') ORDER BY n.createdAt ASC")
    List<Notification> findNotificationsNeedingEmail(@Param("userId") Long userId);
    
    /**
     * Find notifications that haven't been sent via push
     */
    @Query("SELECT n FROM Notification n WHERE n.userId = :userId AND n.pushSent = false AND n.status IN ('PENDING', 'SENT') ORDER BY n.createdAt ASC")
    List<Notification> findNotificationsNeedingPush(@Param("userId") Long userId);
    
    /**
     * Delete old notifications (older than specified date)
     */
    void deleteByCreatedAtBefore(LocalDateTime cutoffDate);
    
    /**
     * Find high priority unread notifications
     */
    @Query("SELECT n FROM Notification n WHERE n.userId = :userId AND n.status = 'UNREAD' AND n.priority IN ('HIGH', 'URGENT') ORDER BY n.priority DESC, n.createdAt DESC")
    List<Notification> findHighPriorityUnreadNotifications(@Param("userId") Long userId);
    
    /**
     * Find notifications for digest (based on frequency and last sent time)
     */
    @Query("SELECT n FROM Notification n WHERE n.userId = :userId AND n.status = 'UNREAD' AND n.createdAt >= :since ORDER BY n.priority DESC, n.createdAt DESC")
    List<Notification> findNotificationsForDigest(@Param("userId") Long userId, @Param("since") LocalDateTime since);
}