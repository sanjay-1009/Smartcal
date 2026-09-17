package com.smartcalendar.dto;

import jakarta.validation.constraints.NotBlank;

public class LoginRequest {

    @NotBlank(message = "Username or mobile number is required")
    private String usernameOrPhone;

    @NotBlank(message = "Password is required")
    private String password;

    public LoginRequest() {}

    public String getUsernameOrPhone() { return usernameOrPhone; }
    public void setUsernameOrPhone(String usernameOrPhone) { this.usernameOrPhone = usernameOrPhone; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
