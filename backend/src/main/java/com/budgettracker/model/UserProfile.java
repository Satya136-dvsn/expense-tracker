package com.budgettracker.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * User Profile entity for managing personal settings and preferences
 * Includes currency preferences, timezone, and notification settings
 */
@Entity
@Table(name = "user_profiles")
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", unique = true, nullable = false)
    private Long userId;

    @Column(name = "preferred_currency", length = 3, nullable = false)
    private String preferredCurrency = "INR"; // Default to Indian Rupees

    @Column(name = "timezone", length = 50)
    private String timezone = "Asia/Kolkata"; // Default to Indian Standard Time

    @Column(name = "date_format", length = 20)
    private String dateFormat = "DD/MM/YYYY"; // Indian date format

    @Column(name = "number_format", length = 20)
    private String numberFormat = "IN"; // Indian number format (lakhs, crores)

    @Column(name = "language", length = 10)
    private String language = "en"; // Default to English

    @Column(name = "theme", length = 20)
    private String theme = "light"; // light, dark, auto

    @Column(name = "email_notifications", nullable = false)
    private Boolean emailNotifications = true;

    @Column(name = "sms_notifications", nullable = false)
    private Boolean smsNotifications = false;

    @Column(name = "push_notifications", nullable = false)
    private Boolean pushNotifications = true;

    @Column(name = "whatsapp_notifications", nullable = false)
    private Boolean whatsappNotifications = false; // For Indian users

    @Column(name = "budget_alerts", nullable = false)
    private Boolean budgetAlerts = true;

    @Column(name = "bill_reminders", nullable = false)
    private Boolean billReminders = true;

    @Column(name = "investment_alerts", nullable = false)
    private Boolean investmentAlerts = true;

    @Column(name = "weekly_summary", nullable = false)
    private Boolean weeklySummary = true;

    @Column(name = "monthly_report", nullable = false)
    private Boolean monthlyReport = true;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Constructors
    public UserProfile() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public UserProfile(Long userId) {
        this();
        this.userId = userId;
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

    public String getPreferredCurrency() {
        return preferredCurrency;
    }

    public void setPreferredCurrency(String preferredCurrency) {
        this.preferredCurrency = preferredCurrency;
        this.updatedAt = LocalDateTime.now();
    }

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
        this.updatedAt = LocalDateTime.now();
    }

    public String getDateFormat() {
        return dateFormat;
    }

    public void setDateFormat(String dateFormat) {
        this.dateFormat = dateFormat;
        this.updatedAt = LocalDateTime.now();
    }

    public String getNumberFormat() {
        return numberFormat;
    }

    public void setNumberFormat(String numberFormat) {
        this.numberFormat = numberFormat;
        this.updatedAt = LocalDateTime.now();
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
        this.updatedAt = LocalDateTime.now();
    }

    public String getTheme() {
        return theme;
    }

    public void setTheme(String theme) {
        this.theme = theme;
        this.updatedAt = LocalDateTime.now();
    }

    public Boolean getEmailNotifications() {
        return emailNotifications;
    }

    public void setEmailNotifications(Boolean emailNotifications) {
        this.emailNotifications = emailNotifications;
        this.updatedAt = LocalDateTime.now();
    }

    public Boolean getSmsNotifications() {
        return smsNotifications;
    }

    public void setSmsNotifications(Boolean smsNotifications) {
        this.smsNotifications = smsNotifications;
        this.updatedAt = LocalDateTime.now();
    }

    public Boolean getPushNotifications() {
        return pushNotifications;
    }

    public void setPushNotifications(Boolean pushNotifications) {
        this.pushNotifications = pushNotifications;
        this.updatedAt = LocalDateTime.now();
    }

    public Boolean getWhatsappNotifications() {
        return whatsappNotifications;
    }

    public void setWhatsappNotifications(Boolean whatsappNotifications) {
        this.whatsappNotifications = whatsappNotifications;
        this.updatedAt = LocalDateTime.now();
    }

    public Boolean getBudgetAlerts() {
        return budgetAlerts;
    }

    public void setBudgetAlerts(Boolean budgetAlerts) {
        this.budgetAlerts = budgetAlerts;
        this.updatedAt = LocalDateTime.now();
    }

    public Boolean getBillReminders() {
        return billReminders;
    }

    public void setBillReminders(Boolean billReminders) {
        this.billReminders = billReminders;
        this.updatedAt = LocalDateTime.now();
    }

    public Boolean getInvestmentAlerts() {
        return investmentAlerts;
    }

    public void setInvestmentAlerts(Boolean investmentAlerts) {
        this.investmentAlerts = investmentAlerts;
        this.updatedAt = LocalDateTime.now();
    }

    public Boolean getWeeklySummary() {
        return weeklySummary;
    }

    public void setWeeklySummary(Boolean weeklySummary) {
        this.weeklySummary = weeklySummary;
        this.updatedAt = LocalDateTime.now();
    }

    public Boolean getMonthlyReport() {
        return monthlyReport;
    }

    public void setMonthlyReport(Boolean monthlyReport) {
        this.monthlyReport = monthlyReport;
        this.updatedAt = LocalDateTime.now();
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

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @Override
    public String toString() {
        return "UserProfile{" +
                "id=" + id +
                ", userId=" + userId +
                ", preferredCurrency='" + preferredCurrency + '\'' +
                ", timezone='" + timezone + '\'' +
                ", theme='" + theme + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}