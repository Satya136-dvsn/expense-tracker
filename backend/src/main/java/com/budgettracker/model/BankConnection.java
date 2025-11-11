package com.budgettracker.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "bank_connections")
public class BankConnection {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "User is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "institution_id", length = 100)
    private String institutionId;
    
    @Column(name = "institution_name", length = 100)
    private String institutionName;
    
    @Column(name = "access_token", length = 500)
    private String accessToken; // This would be encrypted in production
    
    @Column(name = "item_id", length = 100)
    private String itemId; // Plaid item ID
    
    @NotNull(message = "Connection status is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ConnectionStatus status = ConnectionStatus.ACTIVE;
    
    @Column(name = "last_successful_sync")
    private LocalDateTime lastSuccessfulSync;
    
    @Column(name = "last_error_message", length = 500)
    private String lastErrorMessage;
    
    @Column(name = "consent_expiration")
    private LocalDateTime consentExpiration;
    
    @Column(name = "webhook_url", length = 255)
    private String webhookUrl;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors
    public BankConnection() {}
    
    public BankConnection(User user, String institutionId, String institutionName) {
        this.user = user;
        this.institutionId = institutionId;
        this.institutionName = institutionName;
    }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public String getInstitutionId() {
        return institutionId;
    }
    
    public void setInstitutionId(String institutionId) {
        this.institutionId = institutionId;
    }
    
    public String getInstitutionName() {
        return institutionName;
    }
    
    public void setInstitutionName(String institutionName) {
        this.institutionName = institutionName;
    }
    
    public String getAccessToken() {
        return accessToken;
    }
    
    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }
    
    public String getItemId() {
        return itemId;
    }
    
    public void setItemId(String itemId) {
        this.itemId = itemId;
    }
    
    public ConnectionStatus getStatus() {
        return status;
    }
    
    public void setStatus(ConnectionStatus status) {
        this.status = status;
    }
    
    public LocalDateTime getLastSuccessfulSync() {
        return lastSuccessfulSync;
    }
    
    public void setLastSuccessfulSync(LocalDateTime lastSuccessfulSync) {
        this.lastSuccessfulSync = lastSuccessfulSync;
    }
    
    public String getLastErrorMessage() {
        return lastErrorMessage;
    }
    
    public void setLastErrorMessage(String lastErrorMessage) {
        this.lastErrorMessage = lastErrorMessage;
    }
    
    public LocalDateTime getConsentExpiration() {
        return consentExpiration;
    }
    
    public void setConsentExpiration(LocalDateTime consentExpiration) {
        this.consentExpiration = consentExpiration;
    }
    
    public String getWebhookUrl() {
        return webhookUrl;
    }
    
    public void setWebhookUrl(String webhookUrl) {
        this.webhookUrl = webhookUrl;
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
    public enum ConnectionStatus {
        ACTIVE,
        INACTIVE,
        ERROR,
        REQUIRES_UPDATE,
        EXPIRED,
        DISCONNECTED
    }
    
    @Override
    public String toString() {
        return "BankConnection{" +
                "id=" + id +
                ", institutionName='" + institutionName + '\'' +
                ", status=" + status +
                ", lastSuccessfulSync=" + lastSuccessfulSync +
                '}';
    }
}