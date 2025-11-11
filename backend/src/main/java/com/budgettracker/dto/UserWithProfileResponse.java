package com.budgettracker.dto;

import com.budgettracker.model.User;
import com.budgettracker.model.UserProfile;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for combined user and profile data responses
 * Contains both user information and profile settings for API responses
 */
public class UserWithProfileResponse {

    // User data
    private Long id;
    private String username;
    private String email;
    private String role;
    private Boolean enabled;
    private BigDecimal monthlyIncome;
    private BigDecimal currentSavings;
    private BigDecimal targetExpenses;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    // Profile data
    private Long profileId;
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

    // Constructors
    public UserWithProfileResponse() {}

    public UserWithProfileResponse(User user, UserProfile userProfile) {
        // User data
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.role = user.getRole().name();
        this.enabled = user.isEnabled();
        this.monthlyIncome = user.getMonthlyIncome();
        this.currentSavings = user.getCurrentSavings();
        this.targetExpenses = user.getTargetExpenses();
        this.createdAt = user.getCreatedAt();

        // Profile data (if available)
        if (userProfile != null) {
            this.profileId = userProfile.getId();
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
        } else {
            // Default profile values
            this.preferredCurrency = "INR";
            this.timezone = "Asia/Kolkata";
            this.dateFormat = "DD/MM/YYYY";
            this.numberFormat = "IN";
            this.language = "en";
            this.theme = "light";
            this.emailNotifications = true;
            this.smsNotifications = false;
            this.pushNotifications = true;
            this.whatsappNotifications = false;
            this.budgetAlerts = true;
            this.billReminders = true;
            this.investmentAlerts = false;
            this.weeklySummary = true;
            this.monthlyReport = true;
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Boolean getEnabled() {
        return enabled;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }

    public BigDecimal getMonthlyIncome() {
        return monthlyIncome;
    }

    public void setMonthlyIncome(BigDecimal monthlyIncome) {
        this.monthlyIncome = monthlyIncome;
    }

    public BigDecimal getCurrentSavings() {
        return currentSavings;
    }

    public void setCurrentSavings(BigDecimal currentSavings) {
        this.currentSavings = currentSavings;
    }

    public BigDecimal getTargetExpenses() {
        return targetExpenses;
    }

    public void setTargetExpenses(BigDecimal targetExpenses) {
        this.targetExpenses = targetExpenses;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Long getProfileId() {
        return profileId;
    }

    public void setProfileId(Long profileId) {
        this.profileId = profileId;
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

    @Override
    public String toString() {
        return "UserWithProfileResponse{" +
                "id=" + id +
                ", username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", role='" + role + '\'' +
                ", enabled=" + enabled +
                ", preferredCurrency='" + preferredCurrency + '\'' +
                ", theme='" + theme + '\'' +
                '}';
    }
}