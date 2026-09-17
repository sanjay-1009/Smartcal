package com.smartcalendar.dto;

import jakarta.validation.constraints.NotBlank;

public class ResendOtpRequest {

    @NotBlank(message = "Username or mobile number is required")
    private String usernameOrPhone;

    public ResendOtpRequest() {}

    public String getUsernameOrPhone() { return usernameOrPhone; }
    public void setUsernameOrPhone(String usernameOrPhone) { this.usernameOrPhone = usernameOrPhone; }
}
