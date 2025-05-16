package com.ticket.servermono.commoncontext.adapters.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
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
        // Use Instant which is designed for machine-readable timestamps
        String formattedTime = Instant.now().toString();
        
        return ResponseEntity.ok(Map.of(
            "serverTime", formattedTime
        ));
    }
}
