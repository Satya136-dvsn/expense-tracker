package com.budgettracker.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

/**
 * DTO for real-time WebSocket updates
 * Contains update type, data, timestamp, and user information
 */
public class RealTimeUpdateDTO {
    
    private String type;
    private Object data;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime timestamp;
    
    private Long userId;
    private String priority = "NORMAL"; // LOW, NORMAL, HIGH, URGENT

    public RealTimeUpdateDTO() {
        this.timestamp = LocalDateTime.now();
    }

    public RealTimeUpdateDTO(String type, Object data) {
        this.type = type;
        this.data = data;
        this.timestamp = LocalDateTime.now();
    }

    public RealTimeUpdateDTO(String type, Object data, Long userId) {
        this.type = type;
        this.data = data;
        this.userId = userId;
        this.timestamp = LocalDateTime.now();
    }

    // Getters and Setters
    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Object getData() {
        return data;
    }

    public void setData(Object data) {
        this.data = data;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    @Override
    public String toString() {
        return "RealTimeUpdateDTO{" +
                "type='" + type + '\'' +
                ", timestamp=" + timestamp +
                ", userId=" + userId +
                ", priority='" + priority + '\'' +
                '}';
    }
}