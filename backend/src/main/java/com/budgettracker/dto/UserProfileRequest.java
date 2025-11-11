package com.budgettracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * DTO for user profile update requests
 * Contains validation rules for user preferences and settings
 */
public class UserProfileRequest {

    @NotBlank(message = "Preferred currency is required")
    @Size(min = 3, max = 3, message = "Currency code must be exactly 3 characters")
    @Pattern(regexp = "^[A-Z]{3}$", message = "Currency code must be 3 uppercase letters")
    private String preferredCurrency;

    @Size(max = 50, message = "Timezone cannot exceed 50 characters")
    private String timezone;

    @Size(max = 20, message = "Date format cannot exceed 20 characters")
    private String dateFormat;

    @Size(max = 20, message = "Number format cannot exceed 20 characters")
    private String numberFormat;

    @Size(max = 10, message = "Language code cannot exceed 10 characters")
    private String language;

    @Pattern(regexp = "^(light|dark|auto)$", message = "Theme must be 'light', 'dark', or 'auto'")
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
    public UserProfileRequest() {}

    // Getters and Setters
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
        return "UserProfileRequest{" +
                "preferredCurrency='" + preferredCurrency + '\'' +
                ", timezone='" + timezone + '\'' +
                ", theme='" + theme + '\'' +
                ", emailNotifications=" + emailNotifications +
                ", pushNotifications=" + pushNotifications +
                '}';
    }
}