package com.smartcalendar.dto;

import java.util.List;

public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String mobileNumber;
    private Boolean isVerified;
    private List<String> roles;

    public JwtResponse() {}

    public JwtResponse(String token, String type, Long id, String username, String mobileNumber, Boolean isVerified, List<String> roles) {
        this.token = token;
        this.type = type != null ? type : "Bearer";
        this.id = id;
        this.username = username;
        this.mobileNumber = mobileNumber;
        this.isVerified = isVerified;
        this.roles = roles;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }
    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }
    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String token;
        private String type = "Bearer";
        private Long id;
        private String username;
        private String mobileNumber;
        private Boolean isVerified;
        private List<String> roles;

        public Builder token(String token) { this.token = token; return this; }
        public Builder type(String type) { this.type = type; return this; }
        public Builder id(Long id) { this.id = id; return this; }
        public Builder username(String username) { this.username = username; return this; }
        public Builder mobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; return this; }
        public Builder isVerified(Boolean isVerified) { this.isVerified = isVerified; return this; }
        public Builder roles(List<String> roles) { this.roles = roles; return this; }
        public JwtResponse build() {
            return new JwtResponse(token, type, id, username, mobileNumber, isVerified, roles);
        }
    }
}
