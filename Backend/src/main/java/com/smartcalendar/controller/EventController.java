package com.smartcalendar.controller;

import com.smartcalendar.dto.*;
import com.smartcalendar.entity.User;
import com.smartcalendar.service.AuthService;
import com.smartcalendar.service.EventService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;
    private final AuthService authService;

    public EventController(EventService eventService, AuthService authService) {
        this.eventService = eventService;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<EventResponseDto>>> getEvents(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "false") boolean upcoming) {

        User user = authService.getCurrentAuthenticatedUser();
        List<EventResponseDto> events;

        if (upcoming) {
            events = eventService.getUpcomingEvents(user);
        } else if (search != null && !search.isBlank()) {
            events = eventService.searchEvents(user, search);
        } else if (startDate != null && endDate != null) {
            events = eventService.getEventsByDateRange(user, startDate, endDate);
        } else {
            events = eventService.getAllEvents(user);
        }

        return ResponseEntity.ok(ApiResponse.ok(events));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EventResponseDto>> getEventById(@PathVariable Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        EventResponseDto event = eventService.getEventById(user, id);
        return ResponseEntity.ok(ApiResponse.ok(event));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EventResponseDto>> createEvent(@Valid @RequestBody EventRequestDto request) {
        User user = authService.getCurrentAuthenticatedUser();
        EventResponseDto created = eventService.createEvent(user, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Event created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EventResponseDto>> updateEvent(
            @PathVariable Long id,
            @Valid @RequestBody EventRequestDto request) {
        User user = authService.getCurrentAuthenticatedUser();
        EventResponseDto updated = eventService.updateEvent(user, id, request);
        return ResponseEntity.ok(ApiResponse.ok("Event updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(@PathVariable Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        eventService.deleteEvent(user, id);
        return ResponseEntity.ok(ApiResponse.ok("Event deleted successfully", null));
    }

    @PostMapping("/conflicts/check")
    public ResponseEntity<ApiResponse<ConflictResultDto>> checkConflict(@Valid @RequestBody ConflictCheckDto request) {
        User user = authService.getCurrentAuthenticatedUser();
        ConflictResultDto result = eventService.checkConflicts(user, request);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }
}
