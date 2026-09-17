package com.smartcalendar.dto;

import jakarta.validation.constraints.NotBlank;

public class VerifyOtpRequest {

    @NotBlank(message = "Username or mobile number is required")
    private String usernameOrPhone;

    @NotBlank(message = "OTP code is required")
    private String otpCode;

    public VerifyOtpRequest() {}

    public String getUsernameOrPhone() { return usernameOrPhone; }
    public void setUsernameOrPhone(String usernameOrPhone) { this.usernameOrPhone = usernameOrPhone; }
    public String getOtpCode() { return otpCode; }
    public void setOtpCode(String otpCode) { this.otpCode = otpCode; }
}
