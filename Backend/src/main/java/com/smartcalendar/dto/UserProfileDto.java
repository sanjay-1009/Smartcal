package com.smartcalendar.dto;

import java.time.LocalDateTime;

public class UserProfileDto {
    private Long id;
    private String username;
    private String mobileNumber;
    private Boolean isVerified;
    private String role;
    private long totalEvents;
    private long upcomingEvents;
    private long unreadNotifications;
    private LocalDateTime createdAt;

    public UserProfileDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }
    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public long getTotalEvents() { return totalEvents; }
    public void setTotalEvents(long totalEvents) { this.totalEvents = totalEvents; }
    public long getUpcomingEvents() { return upcomingEvents; }
    public void setUpcomingEvents(long upcomingEvents) { this.upcomingEvents = upcomingEvents; }
    public long getUnreadNotifications() { return unreadNotifications; }
    public void setUnreadNotifications(long unreadNotifications) { this.unreadNotifications = unreadNotifications; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final UserProfileDto dto = new UserProfileDto();
        public Builder id(Long id) { dto.id = id; return this; }
        public Builder username(String username) { dto.username = username; return this; }
        public Builder mobileNumber(String mobileNumber) { dto.mobileNumber = mobileNumber; return this; }
        public Builder isVerified(Boolean isVerified) { dto.isVerified = isVerified; return this; }
        public Builder role(String role) { dto.role = role; return this; }
        public Builder totalEvents(long totalEvents) { dto.totalEvents = totalEvents; return this; }
        public Builder upcomingEvents(long upcomingEvents) { dto.upcomingEvents = upcomingEvents; return this; }
        public Builder unreadNotifications(long unreadNotifications) { dto.unreadNotifications = unreadNotifications; return this; }
        public Builder createdAt(LocalDateTime createdAt) { dto.createdAt = createdAt; return this; }
        public UserProfileDto build() { return dto; }
    }
}
