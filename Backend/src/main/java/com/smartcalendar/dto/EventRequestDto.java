package com.smartcalendar.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public class EventRequestDto {

    @NotBlank(message = "Event name is required")
    private String eventName;

    private String description;

    @NotNull(message = "Start date is required")
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

    private String category = "GENERAL";

    private String priority = "MEDIUM";

    private Integer reminderMinutesBefore = 60;

    private String sourceType;
    private String originalContent;

    public EventRequestDto() {}

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
    public String getSourceType() { return sourceType; }
    public void setSourceType(String sourceType) { this.sourceType = sourceType; }
    public String getOriginalContent() { return originalContent; }
    public void setOriginalContent(String originalContent) { this.originalContent = originalContent; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final EventRequestDto dto = new EventRequestDto();
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
        public Builder sourceType(String sourceType) { dto.sourceType = sourceType; return this; }
        public Builder originalContent(String originalContent) { dto.originalContent = originalContent; return this; }
        public EventRequestDto build() { return dto; }
    }
}
