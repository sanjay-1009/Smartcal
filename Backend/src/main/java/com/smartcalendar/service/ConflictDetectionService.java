package com.smartcalendar.service;

import com.smartcalendar.dto.ConflictCheckDto;
import com.smartcalendar.dto.ConflictResultDto;
import com.smartcalendar.dto.EventResponseDto;
import com.smartcalendar.entity.Event;
import com.smartcalendar.entity.User;
import com.smartcalendar.repository.EventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Service
public class ConflictDetectionService {

    private static final Logger log = LoggerFactory.getLogger(ConflictDetectionService.class);

    private final EventRepository eventRepository;

    public ConflictDetectionService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    public ConflictResultDto checkConflict(User user, ConflictCheckDto checkDto) {
        LocalDate startDate = checkDto.getStartDate();
        LocalDate endDate = checkDto.getEndDate() != null ? checkDto.getEndDate() : startDate;
        LocalTime startTime = checkDto.getStartTime();
        LocalTime endTime = checkDto.getEndTime();

        if (startDate.equals(endDate) && startTime != null && endTime != null && endTime.isBefore(startTime)) {
            endTime = startTime.plusHours(1);
        }

        List<Event> existingEvents = eventRepository.findByUserAndDateRange(user, startDate.minusDays(1), endDate.plusDays(1));

        Map<LocalDate, List<Event>> dateMap = new HashMap<>();
        for (Event event : existingEvents) {
            if (checkDto.getEventId() != null && event.getId().equals(checkDto.getEventId())) {
                continue;
            }
            LocalDate eStart = event.getStartDate();
            LocalDate eEnd = event.getEndDate() != null ? event.getEndDate() : eStart;

            LocalDate cur = eStart;
            while (!cur.isAfter(eEnd)) {
                dateMap.computeIfAbsent(cur, k -> new ArrayList<>()).add(event);
                cur = cur.plusDays(1);
            }
        }

        Set<Event> conflictingEvents = new LinkedHashSet<>();
        boolean isTimeConflict = false;

        LocalDate curDate = startDate;
        while (!curDate.isAfter(endDate)) {
            List<Event> eventsOnDate = dateMap.get(curDate);
            if (eventsOnDate != null) {
                for (Event existing : eventsOnDate) {
                    if (isOverlapping(startDate, startTime, endDate, endTime, existing)) {
                        conflictingEvents.add(existing);
                        if (hasExactTimeCollision(startDate, startTime, endDate, endTime, existing)) {
                            isTimeConflict = true;
                        }
                    }
                }
            }
            curDate = curDate.plusDays(1);
        }

        if (conflictingEvents.isEmpty()) {
            return ConflictResultDto.builder()
                    .hasConflict(false)
                    .isTimeConflict(false)
                    .message("No scheduling conflicts detected.")
                    .conflictingEvents(Collections.emptyList())
                    .build();
        }

        List<EventResponseDto> conflictDtos = conflictingEvents.stream()
                .map(EventResponseDto::fromEntity)
                .toList();

        String message = isTimeConflict
                ? "Time Conflict: You already have " + conflictDtos.size() + " overlapping event(s) scheduled at this time."
                : "Schedule Warning: You already have " + conflictDtos.size() + " event(s) scheduled on the same date.";

        return ConflictResultDto.builder()
                .hasConflict(true)
                .isTimeConflict(isTimeConflict)
                .message(message)
                .conflictingEvents(conflictDtos)
                .build();
    }

    private boolean isOverlapping(LocalDate sDate1, LocalTime sTime1, LocalDate eDate1, LocalTime eTime1, Event e2) {
        LocalDate sDate2 = e2.getStartDate();
        LocalDate eDate2 = e2.getEndDate() != null ? e2.getEndDate() : sDate2;

        if (sDate1.isAfter(eDate2) || sDate2.isAfter(eDate1)) {
            return false;
        }
        return true;
    }

    private boolean hasExactTimeCollision(LocalDate sDate1, LocalTime sTime1, LocalDate eDate1, LocalTime eTime1, Event e2) {
        if (sTime1 == null || e2.getStartTime() == null) {
            return false;
        }

        LocalTime sTime2 = e2.getStartTime();
        LocalTime eTime2 = e2.getEndTime() != null ? e2.getEndTime() : sTime2.plusHours(1);
        LocalTime actualETime1 = eTime1 != null ? eTime1 : sTime1.plusHours(1);

        LocalDateTime start1 = LocalDateTime.of(sDate1, sTime1);
        LocalDateTime end1 = LocalDateTime.of(eDate1, actualETime1);

        LocalDate eDate2 = e2.getEndDate() != null ? e2.getEndDate() : e2.getStartDate();
        LocalDateTime start2 = LocalDateTime.of(e2.getStartDate(), sTime2);
        LocalDateTime end2 = LocalDateTime.of(eDate2, eTime2);

        return start1.isBefore(end2) && start2.isBefore(end1);
    }
}
