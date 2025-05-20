package com.ticket.servermono.commoncontext.utils;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Utility class for consistent time handling across the application
 * Ensures all time operations use the same timezone (Asia/Ho_Chi_Minh - UTC+7)
 */
public class TimeUtils {
    
    private static final ZoneId VIETNAM_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_DATE_TIME;

    /**
     * Get current LocalDateTime in Vietnam timezone (UTC+7)
     * @return current time as LocalDateTime
     */
    public static LocalDateTime now() {
        return LocalDateTime.now(VIETNAM_ZONE);
    }
    
    /**
     * Get current Instant 
     * @return current time as Instant
     */
    public static Instant instantNow() {
        return Instant.now();
    }
    
    /**
     * Add minutes to current LocalDateTime
     * @param minutes number of minutes to add
     * @return LocalDateTime with added minutes
     */
    public static LocalDateTime nowPlusMinutes(long minutes) {
        return now().plusMinutes(minutes);
    }
    
    /**
     * Add hours to current LocalDateTime
     * @param hours number of hours to add
     * @return LocalDateTime with added hours
     */
    public static LocalDateTime nowPlusHours(long hours) {
        return now().plusHours(hours);
    }
    
    /**
     * Convert Instant to LocalDateTime in Vietnam timezone
     * @param instant the instant to convert
     * @return LocalDateTime in Vietnam timezone
     */
    public static LocalDateTime instantToLocalDateTime(Instant instant) {
        return LocalDateTime.ofInstant(instant, VIETNAM_ZONE);
    }
    
    /**
     * Format LocalDateTime to ISO string
     * @param dateTime the LocalDateTime to format
     * @return formatted ISO datetime string
     */
    public static String formatISODateTime(LocalDateTime dateTime) {
        return dateTime.format(ISO_FORMATTER);
    }
    
    /**
     * Format current time to ISO string
     * @return current time formatted as ISO datetime string
     */
    public static String nowAsISOString() {
        return formatISODateTime(now());
    }
}
