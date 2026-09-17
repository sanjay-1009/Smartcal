package com.smartcalendar.dto;

import java.util.List;

public class ConflictResultDto {
    private boolean hasConflict;
    private boolean isTimeConflict;
    private String message;
    private List<EventResponseDto> conflictingEvents;

    public ConflictResultDto() {}

    public boolean isHasConflict() { return hasConflict; }
    public void setHasConflict(boolean hasConflict) { this.hasConflict = hasConflict; }
    public boolean isTimeConflict() { return isTimeConflict; }
    public void setTimeConflict(boolean timeConflict) { isTimeConflict = timeConflict; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public List<EventResponseDto> getConflictingEvents() { return conflictingEvents; }
    public void setConflictingEvents(List<EventResponseDto> conflictingEvents) { this.conflictingEvents = conflictingEvents; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final ConflictResultDto dto = new ConflictResultDto();
        public Builder hasConflict(boolean hasConflict) { dto.hasConflict = hasConflict; return this; }
        public Builder isTimeConflict(boolean isTimeConflict) { dto.isTimeConflict = isTimeConflict; return this; }
        public Builder message(String message) { dto.message = message; return this; }
        public Builder conflictingEvents(List<EventResponseDto> conflictingEvents) { dto.conflictingEvents = conflictingEvents; return this; }
        public ConflictResultDto build() { return dto; }
    }
}
