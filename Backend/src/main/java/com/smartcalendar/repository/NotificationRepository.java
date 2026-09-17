package com.smartcalendar.repository;

import com.smartcalendar.entity.Notification;
import com.smartcalendar.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUser(User user);
    List<Notification> findByUserOrderByNotificationTimeDesc(User user);
    List<Notification> findByUserAndStatusOrderByNotificationTimeDesc(User user, String status);
    long countByUserAndStatus(User user, String status);
}
