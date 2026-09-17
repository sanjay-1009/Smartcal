package com.smartcalendar.service;

import com.smartcalendar.dto.UserProfileDto;
import com.smartcalendar.entity.User;
import com.smartcalendar.repository.EventRepository;
import com.smartcalendar.repository.NotificationRepository;
import com.smartcalendar.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final NotificationRepository notificationRepository;

    public UserService(UserRepository userRepository, EventRepository eventRepository, NotificationRepository notificationRepository) {
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.notificationRepository = notificationRepository;
    }

    @Transactional(readOnly = true)
    public UserProfileDto getUserProfile(User user) {
        long totalEvents = eventRepository.findByUserOrderByStartDateAscStartTimeAsc(user).size();
        long upcomingEvents = eventRepository.findUpcomingEventsByUser(user, LocalDate.now()).size();
        long unreadNotifications = notificationRepository.countByUserAndStatus(user, "UNREAD");

        return UserProfileDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .mobileNumber(user.getMobileNumber())
                .isVerified(user.getIsVerified())
                .role(user.getRole())
                .totalEvents(totalEvents)
                .upcomingEvents(upcomingEvents)
                .unreadNotifications(unreadNotifications)
                .createdAt(user.getCreatedAt())
                .build();
    }
}
