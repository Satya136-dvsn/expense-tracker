package com.budgettracker.dto;

import com.budgettracker.model.UserProfile;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

/**
 * DTO for user profile responses
 * Contains user preferences and settings for API responses
 */
public class UserProfileResponse {

    private Long id;
    private Long userId;
    private String preferredCurrency;
    private String timezone;
    private String dateFormat;
    private String numberFormat;
    private String language;
    private String theme;
    private Boolean emailNotifications;
    private Boolean smsNotifications;
    private Boolean pushNotifications;
    private Boolean whatsappNotifications;
    private Boolean budgetAlerts;
    private Boolean billReminders;
    private Boolean investmentAlerts;
    private Boolean weeklySummary;
    private Boolean monthlyReport;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    // Constructors
    public UserProfileResponse() {}

    public UserProfileResponse(UserProfile userProfile) {
        this.id = userProfile.getId();
        this.userId = userProfile.getUserId();
        this.preferredCurrency = userProfile.getPreferredCurrency();
        this.timezone = userProfile.getTimezone();
        this.dateFormat = userProfile.getDateFormat();
        this.numberFormat = userProfile.getNumberFormat();
        this.language = userProfile.getLanguage();
        this.theme = userProfile.getTheme();
        this.emailNotifications = userProfile.getEmailNotifications();
        this.smsNotifications = userProfile.getSmsNotifications();
        this.pushNotifications = userProfile.getPushNotifications();
        this.whatsappNotifications = userProfile.getWhatsappNotifications();
        this.budgetAlerts = userProfile.getBudgetAlerts();
        this.billReminders = userProfile.getBillReminders();
        this.investmentAlerts = userProfile.getInvestmentAlerts();
        this.weeklySummary = userProfile.getWeeklySummary();
        this.monthlyReport = userProfile.getMonthlyReport();
        this.createdAt = userProfile.getCreatedAt();
        this.updatedAt = userProfile.getUpdatedAt();
    }

    // Static factory method
    public static UserProfileResponse fromEntity(UserProfile userProfile) {
        return new UserProfileResponse(userProfile);
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
    }

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public String getDateFormat() {
        return dateFormat;
    }

    public void setDateFormat(String dateFormat) {
        this.dateFormat = dateFormat;
    }

    public String getNumberFormat() {
        return numberFormat;
    }

    public void setNumberFormat(String numberFormat) {
        this.numberFormat = numberFormat;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getTheme() {
        return theme;
    }

    public void setTheme(String theme) {
        this.theme = theme;
    }

    public Boolean getEmailNotifications() {
        return emailNotifications;
    }

    public void setEmailNotifications(Boolean emailNotifications) {
        this.emailNotifications = emailNotifications;
    }

    public Boolean getSmsNotifications() {
        return smsNotifications;
    }

    public void setSmsNotifications(Boolean smsNotifications) {
        this.smsNotifications = smsNotifications;
    }

    public Boolean getPushNotifications() {
        return pushNotifications;
    }

    public void setPushNotifications(Boolean pushNotifications) {
        this.pushNotifications = pushNotifications;
    }

    public Boolean getWhatsappNotifications() {
        return whatsappNotifications;
    }

    public void setWhatsappNotifications(Boolean whatsappNotifications) {
        this.whatsappNotifications = whatsappNotifications;
    }

    public Boolean getBudgetAlerts() {
        return budgetAlerts;
    }

    public void setBudgetAlerts(Boolean budgetAlerts) {
        this.budgetAlerts = budgetAlerts;
    }

    public Boolean getBillReminders() {
        return billReminders;
    }

    public void setBillReminders(Boolean billReminders) {
        this.billReminders = billReminders;
    }

    public Boolean getInvestmentAlerts() {
        return investmentAlerts;
    }

    public void setInvestmentAlerts(Boolean investmentAlerts) {
        this.investmentAlerts = investmentAlerts;
    }

    public Boolean getWeeklySummary() {
        return weeklySummary;
    }

    public void setWeeklySummary(Boolean weeklySummary) {
        this.weeklySummary = weeklySummary;
    }

    public Boolean getMonthlyReport() {
        return monthlyReport;
    }

    public void setMonthlyReport(Boolean monthlyReport) {
        this.monthlyReport = monthlyReport;
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

    @Override
    public String toString() {
        return "UserProfileResponse{" +
                "id=" + id +
                ", userId=" + userId +
                ", preferredCurrency='" + preferredCurrency + '\'' +
                ", timezone='" + timezone + '\'' +
                ", theme='" + theme + '\'' +
                ", updatedAt=" + updatedAt +
                '}';
    }
}