package com.smartcalendar.repository;

import com.smartcalendar.entity.Event;
import com.smartcalendar.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByUserOrderByStartDateAscStartTimeAsc(User user);
    Optional<Event> findByIdAndUser(Long id, User user);

    @Query("SELECT e FROM Event e WHERE e.user = :user AND " +
           "((e.startDate BETWEEN :start AND :end) OR " +
           "(e.endDate IS NOT NULL AND e.endDate BETWEEN :start AND :end) OR " +
           "(e.startDate <= :start AND e.endDate >= :end)) " +
           "ORDER BY e.startDate ASC, e.startTime ASC")
    List<Event> findByUserAndDateRange(@Param("user") User user, 
                                      @Param("start") LocalDate start, 
                                      @Param("end") LocalDate end);

    @Query("SELECT e FROM Event e WHERE e.user = :user AND " +
           "(e.startDate = :date OR e.endDate = :date OR " +
           "(e.startDate <= :date AND e.endDate >= :date))")
    List<Event> findByUserAndDate(@Param("user") User user, @Param("date") LocalDate date);

    @Query("SELECT e FROM Event e WHERE e.user = :user AND " +
           "(e.startDate >= :today OR e.registrationDeadline >= :today OR e.submissionDeadline >= :today) " +
           "ORDER BY e.startDate ASC")
    List<Event> findUpcomingEventsByUser(@Param("user") User user, @Param("today") LocalDate today);

    @Query("SELECT e FROM Event e WHERE e.user = :user AND " +
           "(LOWER(e.eventName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.location) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.coordinatorName) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Event> searchEventsByUser(@Param("user") User user, @Param("query") String query);
}
