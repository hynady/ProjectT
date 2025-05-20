package com.ticket.servermono.commoncontext.infrastructure.config;

import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;
import java.util.TimeZone;

/**
 * Configuration class to set the default timezone for the entire application
 */
@Configuration
public class TimeZoneConfig {

    /**
     * Sets the default JVM timezone to Asia/Ho_Chi_Minh (GMT+7)
     * This ensures consistent timezone handling throughout the application
     */
    @PostConstruct
    public void init() {
        // Set default timezone for JVM to Asia/Ho_Chi_Minh (Vietnam)
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
    }
}
