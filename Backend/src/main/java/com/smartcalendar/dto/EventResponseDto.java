package com.smartcalendar.dto;

import com.smartcalendar.entity.Event;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class EventResponseDto {
    private Long id;
    private Long userId;
    private String eventName;
    private String description;
    private LocalDate startDate;
    private LocalTime startTime;
    private LocalDate endDate;
    private LocalTime endTime;
    private LocalDate registrationDeadline;
    private LocalDate submissionDeadline;
    private String location;
    private String coordinatorName;
    private String coordinatorPhone;
    private String sourceUrl;
    private String category;
    private String priority;
    private Integer reminderMinutesBefore;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public EventResponseDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
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
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static EventResponseDto fromEntity(Event event) {
        EventResponseDto dto = new EventResponseDto();
        dto.setId(event.getId());
        dto.setUserId(event.getUser() != null ? event.getUser().getId() : null);
        dto.setEventName(event.getEventName());
        dto.setDescription(event.getDescription());
        dto.setStartDate(event.getStartDate());
        dto.setStartTime(event.getStartTime());
        dto.setEndDate(event.getEndDate());
        dto.setEndTime(event.getEndTime());
        dto.setRegistrationDeadline(event.getRegistrationDeadline());
        dto.setSubmissionDeadline(event.getSubmissionDeadline());
        dto.setLocation(event.getLocation());
        dto.setCoordinatorName(event.getCoordinatorName());
        dto.setCoordinatorPhone(event.getCoordinatorPhone());
        dto.setSourceUrl(event.getSourceUrl());
        dto.setCategory(event.getCategory());
        dto.setPriority(event.getPriority());
        dto.setReminderMinutesBefore(event.getReminderMinutesBefore());
        dto.setCreatedAt(event.getCreatedAt());
        dto.setUpdatedAt(event.getUpdatedAt());
        return dto;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final EventResponseDto dto = new EventResponseDto();
        public Builder id(Long id) { dto.id = id; return this; }
        public Builder userId(Long userId) { dto.userId = userId; return this; }
        public Builder eventName(String eventName) { dto.eventName = eventName; return this; }
        public Builder description(String description) { dto.description = description; return this; }
        public Builder startDate(LocalDate startDate) { dto.startDate = startDate; return this; }
        public Builder startTime(LocalTime startTime) { dto.startTime = startTime; return this; }
        public Builder endDate(LocalDate endDate) { dto.endDate = endDate; return this; }
        public Builder endTime(LocalTime endTime) { dto.endTime = endTime; return this; }
        public Builder registrationDeadline(LocalDate registrationDeadline) { dto.registrationDeadline = registrationDeadline; return this; }
        public Builder submissionDeadline(LocalDate submissionDeadline) { dto.submissionDeadline = submissionDeadline; return this; }
        public Builder location(String location) { dto.location = location; return this; }
        public Builder coordinatorName(String coordinatorName) { dto.coordinatorName = coordinatorName; return this; }
        public Builder coordinatorPhone(String coordinatorPhone) { dto.coordinatorPhone = coordinatorPhone; return this; }
        public Builder sourceUrl(String sourceUrl) { dto.sourceUrl = sourceUrl; return this; }
        public Builder category(String category) { dto.category = category; return this; }
        public Builder priority(String priority) { dto.priority = priority; return this; }
        public Builder reminderMinutesBefore(Integer reminderMinutesBefore) { dto.reminderMinutesBefore = reminderMinutesBefore; return this; }
        public Builder createdAt(LocalDateTime createdAt) { dto.createdAt = createdAt; return this; }
        public Builder updatedAt(LocalDateTime updatedAt) { dto.updatedAt = updatedAt; return this; }
        public EventResponseDto build() { return dto; }
    }
}
