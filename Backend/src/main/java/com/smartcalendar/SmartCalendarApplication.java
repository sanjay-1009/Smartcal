package com.smartcalendar;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SmartCalendarApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartCalendarApplication.class, args);
    }
}
