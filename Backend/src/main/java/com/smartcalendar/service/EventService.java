package com.smartcalendar.service;

import com.smartcalendar.dto.ConflictCheckDto;
import com.smartcalendar.dto.ConflictResultDto;
import com.smartcalendar.dto.EventRequestDto;
import com.smartcalendar.dto.EventResponseDto;
import com.smartcalendar.entity.Event;
import com.smartcalendar.entity.EventSource;
import com.smartcalendar.entity.Notification;
import com.smartcalendar.entity.User;
import com.smartcalendar.exception.ResourceNotFoundException;
import com.smartcalendar.repository.EventRepository;
import com.smartcalendar.repository.EventSourceRepository;
import com.smartcalendar.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class EventService {

    private static final Logger log = LoggerFactory.getLogger(EventService.class);

    private final EventRepository eventRepository;
    private final EventSourceRepository eventSourceRepository;
    private final NotificationRepository notificationRepository;
    private final ConflictDetectionService conflictDetectionService;

    public EventService(EventRepository eventRepository, EventSourceRepository eventSourceRepository,
                        NotificationRepository notificationRepository, ConflictDetectionService conflictDetectionService) {
        this.eventRepository = eventRepository;
        this.eventSourceRepository = eventSourceRepository;
        this.notificationRepository = notificationRepository;
        this.conflictDetectionService = conflictDetectionService;
    }

    @Transactional(readOnly = true)
    public List<EventResponseDto> getAllEvents(User user) {
        return eventRepository.findByUserOrderByStartDateAscStartTimeAsc(user)
                .stream()
                .map(EventResponseDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<EventResponseDto> getEventsByDateRange(User user, LocalDate startDate, LocalDate endDate) {
        return eventRepository.findByUserAndDateRange(user, startDate, endDate)
                .stream()
                .map(EventResponseDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<EventResponseDto> getUpcomingEvents(User user) {
        return eventRepository.findUpcomingEventsByUser(user, LocalDate.now())
                .stream()
                .map(EventResponseDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<EventResponseDto> searchEvents(User user, String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllEvents(user);
        }
        return eventRepository.searchEventsByUser(user, query.trim())
                .stream()
                .map(EventResponseDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public EventResponseDto getEventById(User user, Long id) {
        Event event = eventRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with ID: " + id));
        return EventResponseDto.fromEntity(event);
    }

    @Transactional
    public EventResponseDto createEvent(User user, EventRequestDto dto) {
        LocalDate endDate = dto.getEndDate() != null ? dto.getEndDate() : dto.getStartDate();
        LocalTime endTime = dto.getEndTime();
        if (dto.getStartTime() != null && endTime == null) {
            endTime = dto.getStartTime().plusHours(1);
        }

        Event event = Event.builder()
                .user(user)
                .eventName(dto.getEventName().trim())
                .description(dto.getDescription())
                .startDate(dto.getStartDate())
                .startTime(dto.getStartTime())
                .endDate(endDate)
                .endTime(endTime)
                .registrationDeadline(dto.getRegistrationDeadline())
                .submissionDeadline(dto.getSubmissionDeadline())
                .location(dto.getLocation())
                .coordinatorName(dto.getCoordinatorName())
                .coordinatorPhone(dto.getCoordinatorPhone())
                .sourceUrl(dto.getSourceUrl())
                .category(dto.getCategory() != null ? dto.getCategory().toUpperCase() : "GENERAL")
                .priority(dto.getPriority() != null ? dto.getPriority().toUpperCase() : "MEDIUM")
                .reminderMinutesBefore(dto.getReminderMinutesBefore() != null ? dto.getReminderMinutesBefore() : 60)
                .build();

        Event savedEvent = eventRepository.save(event);

        if (dto.getSourceType() != null && !dto.getSourceType().isBlank()) {
            EventSource source = EventSource.builder()
                    .event(savedEvent)
                    .sourceType(dto.getSourceType().toUpperCase())
                    .sourceUrl(dto.getSourceUrl())
                    .originalContent(dto.getOriginalContent())
                    .build();
            eventSourceRepository.save(source);
        }

        createInitialEventNotifications(user, savedEvent);

        log.info("Created event id: {} for user: {}", savedEvent.getId(), user.getUsername());
        return EventResponseDto.fromEntity(savedEvent);
    }

    @Transactional
    public EventResponseDto updateEvent(User user, Long id, EventRequestDto dto) {
        Event event = eventRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with ID: " + id));

        LocalDate endDate = dto.getEndDate() != null ? dto.getEndDate() : dto.getStartDate();
        LocalTime endTime = dto.getEndTime();
        if (dto.getStartTime() != null && endTime == null) {
            endTime = dto.getStartTime().plusHours(1);
        }

        event.setEventName(dto.getEventName().trim());
        event.setDescription(dto.getDescription());
        event.setStartDate(dto.getStartDate());
        event.setStartTime(dto.getStartTime());
        event.setEndDate(endDate);
        event.setEndTime(endTime);
        event.setRegistrationDeadline(dto.getRegistrationDeadline());
        event.setSubmissionDeadline(dto.getSubmissionDeadline());
        event.setLocation(dto.getLocation());
        event.setCoordinatorName(dto.getCoordinatorName());
        event.setCoordinatorPhone(dto.getCoordinatorPhone());
        event.setSourceUrl(dto.getSourceUrl());
        if (dto.getCategory() != null) event.setCategory(dto.getCategory().toUpperCase());
        if (dto.getPriority() != null) event.setPriority(dto.getPriority().toUpperCase());
        if (dto.getReminderMinutesBefore() != null) event.setReminderMinutesBefore(dto.getReminderMinutesBefore());

        Event updated = eventRepository.save(event);
        log.info("Updated event id: {} for user: {}", updated.getId(), user.getUsername());
        return EventResponseDto.fromEntity(updated);
    }

    @Transactional
    public void deleteEvent(User user, Long id) {
        Event event = eventRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with ID: " + id));

        eventRepository.delete(event);
        log.info("Deleted event id: {} for user: {}", id, user.getUsername());
    }

    public ConflictResultDto checkConflicts(User user, ConflictCheckDto checkDto) {
        return conflictDetectionService.checkConflict(user, checkDto);
    }

    private void createInitialEventNotifications(User user, Event event) {
        if (event.getRegistrationDeadline() != null) {
            Notification n = Notification.builder()
                    .user(user)
                    .event(event)
                    .notificationType("DEADLINE_REGISTRATION")
                    .notificationTime(event.getRegistrationDeadline().atTime(9, 0))
                    .message("Registration deadline approaching for '" + event.getEventName() + "' on " + event.getRegistrationDeadline())
                    .status("UNREAD")
                    .build();
            notificationRepository.save(n);
        }

        if (event.getSubmissionDeadline() != null) {
            Notification n = Notification.builder()
                    .user(user)
                    .event(event)
                    .notificationType("DEADLINE_SUBMISSION")
                    .notificationTime(event.getSubmissionDeadline().atTime(9, 0))
                    .message("Submission deadline for '" + event.getEventName() + "' is on " + event.getSubmissionDeadline())
                    .status("UNREAD")
                    .build();
            notificationRepository.save(n);
        }

        LocalTime time = event.getStartTime() != null ? event.getStartTime() : LocalTime.of(9, 0);
        LocalDateTime eventStart = event.getStartDate().atTime(time);
        int reminderMinutes = event.getReminderMinutesBefore() != null ? event.getReminderMinutesBefore() : 60;
        LocalDateTime notifyTime = eventStart.minusMinutes(reminderMinutes);

        Notification n = Notification.builder()
                .user(user)
                .event(event)
                .notificationType("EVENT_START")
                .notificationTime(notifyTime)
                .message("Upcoming Event: '" + event.getEventName() + "' starts at " + (event.getStartTime() != null ? event.getStartTime().toString() : "all day") + " on " + event.getStartDate())
                .status("UNREAD")
                .build();
        notificationRepository.save(n);
    }
}
