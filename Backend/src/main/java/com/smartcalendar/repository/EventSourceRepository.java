package com.smartcalendar.repository;

import com.smartcalendar.entity.Event;
import com.smartcalendar.entity.EventSource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventSourceRepository extends JpaRepository<EventSource, Long> {
    List<EventSource> findByEvent(Event event);
}
