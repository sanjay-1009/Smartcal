package com.smartcalendar.controller;

import com.smartcalendar.dto.*;
import com.smartcalendar.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> register(@Valid @RequestBody RegisterRequest request) {
        String msg = authService.register(request);
        return ResponseEntity.ok(ApiResponse.ok(msg, msg));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<JwtResponse>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        JwtResponse jwtResponse = authService.verifyOtp(request);
        return ResponseEntity.ok(ApiResponse.ok("Account verified successfully", jwtResponse));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<String>> resendOtp(@Valid @RequestBody ResendOtpRequest request) {
        String msg = authService.resendOtp(request.getUsernameOrPhone());
        return ResponseEntity.ok(ApiResponse.ok(msg, msg));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<JwtResponse>> login(@Valid @RequestBody LoginRequest request) {
        JwtResponse jwtResponse = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", jwtResponse));
    }
}
