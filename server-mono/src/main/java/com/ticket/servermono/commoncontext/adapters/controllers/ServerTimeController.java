package com.ticket.servermono.commoncontext.adapters.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

/**
 * Controller to provide the server time without authentication requirement
 */
@RestController
@RequestMapping("/v1/common")
public class ServerTimeController {

    /**
     * Returns the current server time in ISO-8601 format
     * @return A response containing the current server time
     */
    @GetMapping("/server-time")
    public ResponseEntity<?> getServerTime() {
        ZonedDateTime now = ZonedDateTime.now();
        String formattedTime = now.format(DateTimeFormatter.ISO_DATE_TIME);
        
        return ResponseEntity.ok(Map.of(
            "serverTime", formattedTime
        ));
    }
}
