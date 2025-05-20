package com.ticket.servermono.commoncontext.adapters.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.TimeZone;

/**
 * Controller for debugging timezone-related issues
 */
@RestController
@RequestMapping("/v1/common")
public class TimeDebugController {

    /**
     * Returns detailed time information to help diagnose timezone issues
     * @return A response containing various time representations
     */
    @GetMapping("/time-debug")
    public ResponseEntity<?> getTimeDebug() {
        Instant now = Instant.now();
        ZoneId systemZone = ZoneId.systemDefault();
        ZoneId vietnamZone = ZoneId.of("Asia/Ho_Chi_Minh");
        
        LocalDateTime localNow = LocalDateTime.now();
        ZonedDateTime systemZonedNow = ZonedDateTime.now(systemZone);
        ZonedDateTime vietnamZonedNow = ZonedDateTime.now(vietnamZone);
        
        Map<String, Object> result = new HashMap<>();
        result.put("instant", now.toString());
        result.put("systemDefaultZone", systemZone.toString());
        result.put("systemDefaultTimeZone", TimeZone.getDefault().getID());
        result.put("localDateTime", localNow.toString());
        result.put("systemZonedDateTime", systemZonedNow.toString());
        result.put("vietnamZonedDateTime", vietnamZonedNow.toString());
        result.put("localDateTimePlusOneHour", localNow.plusHours(1).toString());
        
        return ResponseEntity.ok(result);
    }
}
