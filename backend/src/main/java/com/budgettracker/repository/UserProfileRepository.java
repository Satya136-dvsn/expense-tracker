package com.budgettracker.repository;

import com.budgettracker.model.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for UserProfile entity
 * Handles database operations for user preferences and settings
 */
@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {

    /**
     * Find user profile by user ID
     */
    Optional<UserProfile> findByUserId(Long userId);

    /**
     * Check if user profile exists for given user ID
     */
    boolean existsByUserId(Long userId);

    /**
     * Delete user profile by user ID
     */
    void deleteByUserId(Long userId);

    /**
     * Find user's preferred currency
     */
    @Query("SELECT up.preferredCurrency FROM UserProfile up WHERE up.userId = :userId")
    Optional<String> findPreferredCurrencyByUserId(@Param("userId") Long userId);

    /**
     * Update user's preferred currency
     */
    @Query("UPDATE UserProfile up SET up.preferredCurrency = :currency, up.updatedAt = CURRENT_TIMESTAMP WHERE up.userId = :userId")
    int updatePreferredCurrency(@Param("userId") Long userId, @Param("currency") String currency);

    /**
     * Find user's timezone
     */
    @Query("SELECT up.timezone FROM UserProfile up WHERE up.userId = :userId")
    Optional<String> findTimezoneByUserId(@Param("userId") Long userId);

    /**
     * Update user's theme preference
     */
    @Query("UPDATE UserProfile up SET up.theme = :theme, up.updatedAt = CURRENT_TIMESTAMP WHERE up.userId = :userId")
    int updateTheme(@Param("userId") Long userId, @Param("theme") String theme);

    /**
     * Find users with specific notification preferences enabled
     */
    @Query("SELECT up FROM UserProfile up WHERE " +
           "(:emailNotifications IS NULL OR up.emailNotifications = :emailNotifications) AND " +
           "(:smsNotifications IS NULL OR up.smsNotifications = :smsNotifications) AND " +
           "(:pushNotifications IS NULL OR up.pushNotifications = :pushNotifications)")
    java.util.List<UserProfile> findByNotificationPreferences(
        @Param("emailNotifications") Boolean emailNotifications,
        @Param("smsNotifications") Boolean smsNotifications,
        @Param("pushNotifications") Boolean pushNotifications
    );

    /**
     * Find users who want budget alerts
     */
    @Query("SELECT up FROM UserProfile up WHERE up.budgetAlerts = true")
    java.util.List<UserProfile> findUsersWithBudgetAlertsEnabled();

    /**
     * Find users who want bill reminders
     */
    @Query("SELECT up FROM UserProfile up WHERE up.billReminders = true")
    java.util.List<UserProfile> findUsersWithBillRemindersEnabled();

    /**
     * Find users who want investment alerts
     */
    @Query("SELECT up FROM UserProfile up WHERE up.investmentAlerts = true")
    java.util.List<UserProfile> findUsersWithInvestmentAlertsEnabled();

    /**
     * Find users who want weekly summary
     */
    @Query("SELECT up FROM UserProfile up WHERE up.weeklySummary = true")
    java.util.List<UserProfile> findUsersWithWeeklySummaryEnabled();

    /**
     * Find users who want monthly report
     */
    @Query("SELECT up FROM UserProfile up WHERE up.monthlyReport = true")
    java.util.List<UserProfile> findUsersWithMonthlyReportEnabled();
}