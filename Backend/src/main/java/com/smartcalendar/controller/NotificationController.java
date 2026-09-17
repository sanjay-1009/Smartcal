package com.smartcalendar.controller;

import com.smartcalendar.dto.ApiResponse;
import com.smartcalendar.dto.NotificationDto;
import com.smartcalendar.entity.User;
import com.smartcalendar.service.AuthService;
import com.smartcalendar.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final AuthService authService;

    public NotificationController(NotificationService notificationService, AuthService authService) {
        this.notificationService = notificationService;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getNotifications() {
        User user = authService.getCurrentAuthenticatedUser();
        List<NotificationDto> notifications = notificationService.getUserNotifications(user);
        return ResponseEntity.ok(ApiResponse.ok(notifications));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount() {
        User user = authService.getCurrentAuthenticatedUser();
        long count = notificationService.getUnreadCount(user);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("unreadCount", count)));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        notificationService.markAsRead(user, id);
        return ResponseEntity.ok(ApiResponse.ok("Notification marked as read", null));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        User user = authService.getCurrentAuthenticatedUser();
        notificationService.markAllAsRead(user);
        return ResponseEntity.ok(ApiResponse.ok("All notifications marked as read", null));
    }
}
