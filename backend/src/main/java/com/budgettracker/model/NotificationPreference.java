package com.budgettracker.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notification_preferences")
public class NotificationPreference {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;
    
    // Email preferences
    @Column(name = "email_enabled", nullable = false)
    private Boolean emailEnabled = true;
    
    @Column(name = "email_bill_reminders", nullable = false)
    private Boolean emailBillReminders = true;
    
    @Column(name = "email_overdue_bills", nullable = false)
    private Boolean emailOverdueBills = true;
    
    @Column(name = "email_payment_confirmations", nullable = false)
    private Boolean emailPaymentConfirmations = true;
    
    @Column(name = "email_budget_alerts", nullable = false)
    private Boolean emailBudgetAlerts = true;
    
    @Column(name = "email_goal_milestones", nullable = false)
    private Boolean emailGoalMilestones = true;
    
    // Push notification preferences
    @Column(name = "push_enabled", nullable = false)
    private Boolean pushEnabled = true;
    
    @Column(name = "push_bill_reminders", nullable = false)
    private Boolean pushBillReminders = true;
    
    @Column(name = "push_overdue_bills", nullable = false)
    private Boolean pushOverdueBills = true;
    
    @Column(name = "push_payment_confirmations", nullable = false)
    private Boolean pushPaymentConfirmations = false;
    
    @Column(name = "push_budget_alerts", nullable = false)
    private Boolean pushBudgetAlerts = true;
    
    @Column(name = "push_goal_milestones", nullable = false)
    private Boolean pushGoalMilestones = true;
    
    // In-app notification preferences
    @Column(name = "in_app_enabled", nullable = false)
    private Boolean inAppEnabled = true;
    
    @Column(name = "in_app_bill_reminders", nullable = false)
    private Boolean inAppBillReminders = true;
    
    @Column(name = "in_app_overdue_bills", nullable = false)
    private Boolean inAppOverdueBills = true;
    
    @Column(name = "in_app_payment_confirmations", nullable = false)
    private Boolean inAppPaymentConfirmations = true;
    
    @Column(name = "in_app_budget_alerts", nullable = false)
    private Boolean inAppBudgetAlerts = true;
    
    @Column(name = "in_app_goal_milestones", nullable = false)
    private Boolean inAppGoalMilestones = true;
    
    // Timing preferences
    @Column(name = "quiet_hours_start")
    private Integer quietHoursStart = 22; // 10 PM
    
    @Column(name = "quiet_hours_end")
    private Integer quietHoursEnd = 8; // 8 AM
    
    @Column(name = "timezone")
    private String timezone = "UTC";
    
    // Frequency preferences
    @Column(name = "digest_frequency")
    @Enumerated(EnumType.STRING)
    private DigestFrequency digestFrequency = DigestFrequency.DAILY;
    
    @Column(name = "reminder_advance_days")
    private Integer reminderAdvanceDays = 3;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    // Constructors
    public NotificationPreference() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public NotificationPreference(Long userId) {
        this();
        this.userId = userId;
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    // Helper methods
    public boolean shouldSendEmail(Notification.NotificationType type) {
        if (!emailEnabled) return false;
        
        switch (type) {
            case BILL_REMINDER:
                return emailBillReminders;
            case BILL_OVERDUE:
                return emailOverdueBills;
            case PAYMENT_CONFIRMATION:
                return emailPaymentConfirmations;
            case BUDGET_ALERT:
                return emailBudgetAlerts;
            case GOAL_MILESTONE:
                return emailGoalMilestones;
            default:
                return true;
        }
    }
    
    public boolean shouldSendPush(Notification.NotificationType type) {
        if (!pushEnabled) return false;
        
        switch (type) {
            case BILL_REMINDER:
                return pushBillReminders;
            case BILL_OVERDUE:
                return pushOverdueBills;
            case PAYMENT_CONFIRMATION:
                return pushPaymentConfirmations;
            case BUDGET_ALERT:
                return pushBudgetAlerts;
            case GOAL_MILESTONE:
                return pushGoalMilestones;
            default:
                return true;
        }
    }
    
    public boolean shouldSendInApp(Notification.NotificationType type) {
        if (!inAppEnabled) return false;
        
        switch (type) {
            case BILL_REMINDER:
                return inAppBillReminders;
            case BILL_OVERDUE:
                return inAppOverdueBills;
            case PAYMENT_CONFIRMATION:
                return inAppPaymentConfirmations;
            case BUDGET_ALERT:
                return inAppBudgetAlerts;
            case GOAL_MILESTONE:
                return inAppGoalMilestones;
            default:
                return true;
        }
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public Boolean getEmailEnabled() {
        return emailEnabled;
    }
    
    public void setEmailEnabled(Boolean emailEnabled) {
        this.emailEnabled = emailEnabled;
    }
    
    public Boolean getEmailBillReminders() {
        return emailBillReminders;
    }
    
    public void setEmailBillReminders(Boolean emailBillReminders) {
        this.emailBillReminders = emailBillReminders;
    }
    
    public Boolean getEmailOverdueBills() {
        return emailOverdueBills;
    }
    
    public void setEmailOverdueBills(Boolean emailOverdueBills) {
        this.emailOverdueBills = emailOverdueBills;
    }
    
    public Boolean getEmailPaymentConfirmations() {
        return emailPaymentConfirmations;
    }
    
    public void setEmailPaymentConfirmations(Boolean emailPaymentConfirmations) {
        this.emailPaymentConfirmations = emailPaymentConfirmations;
    }
    
    public Boolean getEmailBudgetAlerts() {
        return emailBudgetAlerts;
    }
    
    public void setEmailBudgetAlerts(Boolean emailBudgetAlerts) {
        this.emailBudgetAlerts = emailBudgetAlerts;
    }
    
    public Boolean getEmailGoalMilestones() {
        return emailGoalMilestones;
    }
    
    public void setEmailGoalMilestones(Boolean emailGoalMilestones) {
        this.emailGoalMilestones = emailGoalMilestones;
    }
    
    public Boolean getPushEnabled() {
        return pushEnabled;
    }
    
    public void setPushEnabled(Boolean pushEnabled) {
        this.pushEnabled = pushEnabled;
    }
    
    public Boolean getPushBillReminders() {
        return pushBillReminders;
    }
    
    public void setPushBillReminders(Boolean pushBillReminders) {
        this.pushBillReminders = pushBillReminders;
    }
    
    public Boolean getPushOverdueBills() {
        return pushOverdueBills;
    }
    
    public void setPushOverdueBills(Boolean pushOverdueBills) {
        this.pushOverdueBills = pushOverdueBills;
    }
    
    public Boolean getPushPaymentConfirmations() {
        return pushPaymentConfirmations;
    }
    
    public void setPushPaymentConfirmations(Boolean pushPaymentConfirmations) {
        this.pushPaymentConfirmations = pushPaymentConfirmations;
    }
    
    public Boolean getPushBudgetAlerts() {
        return pushBudgetAlerts;
    }
    
    public void setPushBudgetAlerts(Boolean pushBudgetAlerts) {
        this.pushBudgetAlerts = pushBudgetAlerts;
    }
    
    public Boolean getPushGoalMilestones() {
        return pushGoalMilestones;
    }
    
    public void setPushGoalMilestones(Boolean pushGoalMilestones) {
        this.pushGoalMilestones = pushGoalMilestones;
    }
    
    public Boolean getInAppEnabled() {
        return inAppEnabled;
    }
    
    public void setInAppEnabled(Boolean inAppEnabled) {
        this.inAppEnabled = inAppEnabled;
    }
    
    public Boolean getInAppBillReminders() {
        return inAppBillReminders;
    }
    
    public void setInAppBillReminders(Boolean inAppBillReminders) {
        this.inAppBillReminders = inAppBillReminders;
    }
    
    public Boolean getInAppOverdueBills() {
        return inAppOverdueBills;
    }
    
    public void setInAppOverdueBills(Boolean inAppOverdueBills) {
        this.inAppOverdueBills = inAppOverdueBills;
    }
    
    public Boolean getInAppPaymentConfirmations() {
        return inAppPaymentConfirmations;
    }
    
    public void setInAppPaymentConfirmations(Boolean inAppPaymentConfirmations) {
        this.inAppPaymentConfirmations = inAppPaymentConfirmations;
    }
    
    public Boolean getInAppBudgetAlerts() {
        return inAppBudgetAlerts;
    }
    
    public void setInAppBudgetAlerts(Boolean inAppBudgetAlerts) {
        this.inAppBudgetAlerts = inAppBudgetAlerts;
    }
    
    public Boolean getInAppGoalMilestones() {
        return inAppGoalMilestones;
    }
    
    public void setInAppGoalMilestones(Boolean inAppGoalMilestones) {
        this.inAppGoalMilestones = inAppGoalMilestones;
    }
    
    public Integer getQuietHoursStart() {
        return quietHoursStart;
    }
    
    public void setQuietHoursStart(Integer quietHoursStart) {
        this.quietHoursStart = quietHoursStart;
    }
    
    public Integer getQuietHoursEnd() {
        return quietHoursEnd;
    }
    
    public void setQuietHoursEnd(Integer quietHoursEnd) {
        this.quietHoursEnd = quietHoursEnd;
    }
    
    public String getTimezone() {
        return timezone;
    }
    
    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }
    
    public DigestFrequency getDigestFrequency() {
        return digestFrequency;
    }
    
    public void setDigestFrequency(DigestFrequency digestFrequency) {
        this.digestFrequency = digestFrequency;
    }
    
    public Integer getReminderAdvanceDays() {
        return reminderAdvanceDays;
    }
    
    public void setReminderAdvanceDays(Integer reminderAdvanceDays) {
        this.reminderAdvanceDays = reminderAdvanceDays;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    // Enums
    public enum DigestFrequency {
        NEVER,
        DAILY,
        WEEKLY,
        MONTHLY
    }
}