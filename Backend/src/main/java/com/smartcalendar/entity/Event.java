package com.smartcalendar.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "events", indexes = {
        @Index(name = "idx_user_dates", columnList = "user_id, start_date, end_date")
})
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(name = "event_name", nullable = false, length = 255)
    private String eventName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "registration_deadline")
    private LocalDate registrationDeadline;

    @Column(name = "submission_deadline")
    private LocalDate submissionDeadline;

    @Column(length = 255)
    private String location;

    @Column(name = "coordinator_name", length = 100)
    private String coordinatorName;

    @Column(name = "coordinator_phone", length = 30)
    private String coordinatorPhone;

    @Column(name = "source_url", length = 1024)
    private String sourceUrl;

    @Column(length = 50)
    private String category = "GENERAL";

    @Column(length = 20)
    private String priority = "MEDIUM";

    @Column(name = "reminder_minutes_before")
    private Integer reminderMinutesBefore = 60;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EventSource> sources = new ArrayList<>();

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Notification> notifications = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Event() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getEventName() { return eventName; }
    public void setEventName(String eventName) { this.eventName = eventName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    public LocalDate getRegistrationDeadline() { return registrationDeadline; }
    public void setRegistrationDeadline(LocalDate registrationDeadline) { this.registrationDeadline = registrationDeadline; }
    public LocalDate getSubmissionDeadline() { return submissionDeadline; }
    public void setSubmissionDeadline(LocalDate submissionDeadline) { this.submissionDeadline = submissionDeadline; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getCoordinatorName() { return coordinatorName; }
    public void setCoordinatorName(String coordinatorName) { this.coordinatorName = coordinatorName; }
    public String getCoordinatorPhone() { return coordinatorPhone; }
    public void setCoordinatorPhone(String coordinatorPhone) { this.coordinatorPhone = coordinatorPhone; }
    public String getSourceUrl() { return sourceUrl; }
    public void setSourceUrl(String sourceUrl) { this.sourceUrl = sourceUrl; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public Integer getReminderMinutesBefore() { return reminderMinutesBefore; }
    public void setReminderMinutesBefore(Integer reminderMinutesBefore) { this.reminderMinutesBefore = reminderMinutesBefore; }
    public List<EventSource> getSources() { return sources; }
    public void setSources(List<EventSource> sources) { this.sources = sources; }
    public List<Notification> getNotifications() { return notifications; }
    public void setNotifications(List<Notification> notifications) { this.notifications = notifications; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final Event event = new Event();
        public Builder id(Long id) { event.id = id; return this; }
        public Builder user(User user) { event.user = user; return this; }
        public Builder eventName(String eventName) { event.eventName = eventName; return this; }
        public Builder description(String description) { event.description = description; return this; }
        public Builder startDate(LocalDate startDate) { event.startDate = startDate; return this; }
        public Builder startTime(LocalTime startTime) { event.startTime = startTime; return this; }
        public Builder endDate(LocalDate endDate) { event.endDate = endDate; return this; }
        public Builder endTime(LocalTime endTime) { event.endTime = endTime; return this; }
        public Builder registrationDeadline(LocalDate registrationDeadline) { event.registrationDeadline = registrationDeadline; return this; }
        public Builder submissionDeadline(LocalDate submissionDeadline) { event.submissionDeadline = submissionDeadline; return this; }
        public Builder location(String location) { event.location = location; return this; }
        public Builder coordinatorName(String coordinatorName) { event.coordinatorName = coordinatorName; return this; }
        public Builder coordinatorPhone(String coordinatorPhone) { event.coordinatorPhone = coordinatorPhone; return this; }
        public Builder sourceUrl(String sourceUrl) { event.sourceUrl = sourceUrl; return this; }
        public Builder category(String category) { event.category = category; return this; }
        public Builder priority(String priority) { event.priority = priority; return this; }
        public Builder reminderMinutesBefore(Integer reminderMinutesBefore) { event.reminderMinutesBefore = reminderMinutesBefore; return this; }
        public Event build() { return event; }
    }
}
