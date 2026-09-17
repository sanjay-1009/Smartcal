package com.smartcalendar.controller;

import com.smartcalendar.dto.ApiResponse;
import com.smartcalendar.dto.UserProfileDto;
import com.smartcalendar.entity.User;
import com.smartcalendar.service.AuthService;
import com.smartcalendar.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;
    private final AuthService authService;

    public UserController(UserService userService, AuthService authService) {
        this.userService = userService;
        this.authService = authService;
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileDto>> getProfile() {
        User user = authService.getCurrentAuthenticatedUser();
        UserProfileDto profile = userService.getUserProfile(user);
        return ResponseEntity.ok(ApiResponse.ok(profile));
    }
}
