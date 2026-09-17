package com.smartcalendar.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications", indexes = {
        @Index(name = "idx_user_status", columnList = "user_id, status")
})
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private Event event;

    @Column(name = "notification_time", nullable = false)
    private LocalDateTime notificationTime;

    @Column(name = "notification_type", nullable = false, length = 50)
    private String notificationType;

    @Column(nullable = false, length = 500)
    private String message;

    @Column(nullable = false, length = 20)
    private String status = "UNREAD";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public Notification() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Event getEvent() { return event; }
    public void setEvent(Event event) { this.event = event; }
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

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final Notification n = new Notification();
        public Builder id(Long id) { n.id = id; return this; }
        public Builder user(User user) { n.user = user; return this; }
        public Builder event(Event event) { n.event = event; return this; }
        public Builder notificationTime(LocalDateTime notificationTime) { n.notificationTime = notificationTime; return this; }
        public Builder notificationType(String notificationType) { n.notificationType = notificationType; return this; }
        public Builder message(String message) { n.message = message; return this; }
        public Builder status(String status) { n.status = status; return this; }
        public Notification build() { return n; }
    }
}
