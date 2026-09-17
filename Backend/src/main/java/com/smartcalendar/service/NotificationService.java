package com.smartcalendar.service;

import com.smartcalendar.dto.NotificationDto;
import com.smartcalendar.entity.Event;
import com.smartcalendar.entity.Notification;
import com.smartcalendar.entity.User;
import com.smartcalendar.exception.ResourceNotFoundException;
import com.smartcalendar.repository.EventRepository;
import com.smartcalendar.repository.NotificationRepository;
import com.smartcalendar.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentLinkedQueue;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    private final Queue<Notification> dispatchQueue = new ConcurrentLinkedQueue<>();

    public NotificationService(NotificationRepository notificationRepository, EventRepository eventRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> getUserNotifications(User user) {
        return notificationRepository.findByUserOrderByNotificationTimeDesc(user)
                .stream()
                .map(NotificationDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(User user) {
        return notificationRepository.countByUserAndStatus(user, "UNREAD");
    }

    @Transactional
    public void markAsRead(User user, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + notificationId));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Notification not found");
        }

        notification.setStatus("READ");
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(User user) {
        List<Notification> unread = notificationRepository.findByUserAndStatusOrderByNotificationTimeDesc(user, "UNREAD");
        for (Notification n : unread) {
            n.setStatus("READ");
        }
        notificationRepository.saveAll(unread);
    }

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void checkAndScheduleUpcomingDeadlineAlerts() {
        LocalDate today = LocalDate.now();
        List<User> users = userRepository.findAll();

        for (User user : users) {
            List<Event> upcomingEvents = eventRepository.findUpcomingEventsByUser(user, today);
            if (upcomingEvents.isEmpty()) continue;

            PriorityQueue<EventDeadlineItem> priorityQueue = new PriorityQueue<>(
                    Comparator.comparing(EventDeadlineItem::deadlineDate)
            );

            for (Event event : upcomingEvents) {
                if (event.getRegistrationDeadline() != null && !event.getRegistrationDeadline().isBefore(today)) {
                    priorityQueue.offer(new EventDeadlineItem(event, event.getRegistrationDeadline(), "REGISTRATION"));
                }
                if (event.getSubmissionDeadline() != null && !event.getSubmissionDeadline().isBefore(today)) {
                    priorityQueue.offer(new EventDeadlineItem(event, event.getSubmissionDeadline(), "SUBMISSION"));
                }
            }

            while (!priorityQueue.isEmpty()) {
                EventDeadlineItem item = priorityQueue.poll();
                long daysLeft = java.time.temporal.ChronoUnit.DAYS.between(today, item.deadlineDate());

                if (daysLeft <= 2) {
                    String alertType = "URGENT_" + item.type();
                    String msg = String.format("URGENT: %s deadline for '%s' is in %d day(s) (%s)",
                            item.type().toLowerCase(), item.event().getEventName(), daysLeft, item.deadlineDate());

                    boolean exists = notificationRepository.findByUser(user).stream()
                            .anyMatch(n -> n.getEvent() != null && n.getEvent().getId().equals(item.event().getId()) &&
                                    n.getNotificationType().equals(alertType) &&
                                    n.getNotificationTime().toLocalDate().equals(today));

                    if (!exists) {
                        Notification n = Notification.builder()
                                .user(user)
                                .event(item.event())
                                .notificationType(alertType)
                                .notificationTime(LocalDateTime.now())
                                .message(msg)
                                .status("UNREAD")
                                .build();
                        dispatchQueue.offer(n);
                    }
                }
            }
        }

        while (!dispatchQueue.isEmpty()) {
            Notification n = dispatchQueue.poll();
            notificationRepository.save(n);
            log.info("Dispatched notification alert to user: {}", n.getUser().getUsername());
        }
    }

    private record EventDeadlineItem(Event event, LocalDate deadlineDate, String type) {}
}
