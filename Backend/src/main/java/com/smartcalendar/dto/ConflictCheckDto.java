package com.smartcalendar.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public class ConflictCheckDto {
    private Long eventId;
    @NotNull
    private LocalDate startDate;
    private LocalTime startTime;
    private LocalDate endDate;
    private LocalTime endTime;

    public ConflictCheckDto() {}

    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final ConflictCheckDto dto = new ConflictCheckDto();
        public Builder eventId(Long eventId) { dto.eventId = eventId; return this; }
        public Builder startDate(LocalDate startDate) { dto.startDate = startDate; return this; }
        public Builder startTime(LocalTime startTime) { dto.startTime = startTime; return this; }
        public Builder endDate(LocalDate endDate) { dto.endDate = endDate; return this; }
        public Builder endTime(LocalTime endTime) { dto.endTime = endTime; return this; }
        public ConflictCheckDto build() { return dto; }
    }
}
