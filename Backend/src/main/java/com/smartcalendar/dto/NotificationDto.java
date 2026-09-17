package com.smartcalendar.dto;

import com.smartcalendar.entity.Notification;

import java.time.LocalDateTime;

public class NotificationDto {
    private Long id;
    private Long eventId;
    private String eventName;
    private LocalDateTime notificationTime;
    private String notificationType;
    private String message;
    private String status;
    private LocalDateTime createdAt;

    public NotificationDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }
    public String getEventName() { return eventName; }
    public void setEventName(String eventName) { this.eventName = eventName; }
    public LocalDateTime getNotificationTime() { return notificationTime; }
    public void setNotificationTime(LocalDateTime notificationTime) { this.notificationTime = notificationTime; }
    public String getNotificationType() { return notificationType; }
    public void setNotificationType(String notificationType) { this.notificationType = notificationType; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static NotificationDto fromEntity(Notification notification) {
        NotificationDto dto = new NotificationDto();
        dto.setId(notification.getId());
        dto.setEventId(notification.getEvent() != null ? notification.getEvent().getId() : null);
        dto.setEventName(notification.getEvent() != null ? notification.getEvent().getEventName() : null);
        dto.setNotificationTime(notification.getNotificationTime());
        dto.setNotificationType(notification.getNotificationType());
        dto.setMessage(notification.getMessage());
        dto.setStatus(notification.getStatus());
        dto.setCreatedAt(notification.getCreatedAt());
        return dto;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final NotificationDto dto = new NotificationDto();
        public Builder id(Long id) { dto.id = id; return this; }
        public Builder eventId(Long eventId) { dto.eventId = eventId; return this; }
        public Builder eventName(String eventName) { dto.eventName = eventName; return this; }
        public Builder notificationTime(LocalDateTime notificationTime) { dto.notificationTime = notificationTime; return this; }
        public Builder notificationType(String notificationType) { dto.notificationType = notificationType; return this; }
        public Builder message(String message) { dto.message = message; return this; }
        public Builder status(String status) { dto.status = status; return this; }
        public Builder createdAt(LocalDateTime createdAt) { dto.createdAt = createdAt; return this; }
        public NotificationDto build() { return dto; }
    }
}
