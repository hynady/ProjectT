package com.ticket.servermono.authcontext.usecases;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticket.servermono.authcontext.entities.EndUser;
import com.ticket.servermono.authcontext.entities.UserStat;
import com.ticket.servermono.authcontext.infrastructure.repositories.EndUserRepository;
import com.ticket.servermono.authcontext.infrastructure.repositories.UserStatRepository;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service class for managing user statistics.
 * Provides functionality to update user statistics based on ticket booking information.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StatServices {
    private static final String TICKET_BOOKING_STATS_TOPIC = "ticket.booking.stats";
    private static final String OCCA_STATS_TOPIC = "occa-stats";
    
    private final UserStatRepository userStatRepository;
    private final EndUserRepository endUserRepository;
    private final ObjectMapper objectMapper;
    
    /**
     * Kafka consumer method that listens for ticket booking stats messages
     * and updates user statistics accordingly.
     * 
     * @param message JSON message containing ticket booking statistics
     */
    @KafkaListener(topics = TICKET_BOOKING_STATS_TOPIC, groupId = "user-stats-group")
    @Transactional    public void consumeTicketBookingStats(String message) {
        log.info("Received ticket booking stats message: {}", message);
        
        try {
            // Parse the message
            @SuppressWarnings("unchecked")
            Map<String, Object> statsMap = objectMapper.readValue(message, Map.class);
            
            // Extract user ID
            String userIdStr = (String) statsMap.get("userId");
            if (userIdStr == null) {
                log.error("Received ticket booking stats without userId");
                return;
            }
            
            UUID userId = UUID.fromString(userIdStr);
              // Extract statistics
            Integer totalOccas = (Integer) statsMap.get("totalOccas");
            Object totalSpentObj = statsMap.get("totalSpent");
            Double totalSpent = null;
            if (totalSpentObj instanceof Double) {
                totalSpent = (Double) totalSpentObj;
            } else if (totalSpentObj instanceof Integer) {
                totalSpent = ((Integer) totalSpentObj).doubleValue();
            } else if (totalSpentObj == null) {
                totalSpent = 0.0; // Default to zero if totalSpent is null
                log.warn("Total spent value is null, defaulting to 0.0");
            } else {
                // Handle case where totalSpentObj is of an unexpected type
                log.warn("Total spent value is of unexpected type: {}, defaulting to 0.0", totalSpentObj.getClass().getName());
                totalSpent = 0.0;
            }
            Integer totalTickets = (Integer) statsMap.get("totalTickets");
            
            if (totalOccas == null || totalTickets == null) {
                log.error("Invalid statistics data received: {}", statsMap);
                return;
            }
            
            // Update user statistics
            updateUserStats(userId, totalOccas, totalSpent, totalTickets);
            
        } catch (JsonProcessingException e) {
            log.error("Error parsing ticket booking stats message: {}", e.getMessage(), e);
        } catch (Exception e) {
            log.error("Error processing ticket booking stats: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Updates user statistics with the provided values.
     * If user stats don't exist yet, creates a new entry.
     * 
     * @param userId ID of the user
     * @param eventsAttended Total number of events the user has attended
     * @param totalSpent Total amount spent by the user
     * @param ticketsPurchased Total number of tickets purchased by the user
     */
    @Transactional
    public void updateUserStats(UUID userId, int eventsAttended, double totalSpent, int ticketsPurchased) {
        log.info("Updating user stats for user {}: events={}, spent={}, tickets={}", 
                userId, eventsAttended, totalSpent, ticketsPurchased);
        
        // Find user stats or create if not exists
        Optional<UserStat> optionalUserStat = userStatRepository.findByUserId(userId);
        
        if (optionalUserStat.isPresent()) {
            // Update existing stats
            UserStat userStat = optionalUserStat.get();
            userStat.setEventsAttended(eventsAttended);
            userStat.setTotalSpent(BigDecimal.valueOf(totalSpent));
            userStat.setTicketsPurchased(ticketsPurchased);
            userStatRepository.save(userStat);
            log.info("Updated existing stats for user: {}", userId);
        } else {
            // Create new stats entry
            EndUser user = endUserRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
            
            UserStat userStat = new UserStat(user);
            userStat.setEventsAttended(eventsAttended);
            userStat.setTotalSpent(BigDecimal.valueOf(totalSpent));
            userStat.setTicketsPurchased(ticketsPurchased);            userStatRepository.save(userStat);
            log.info("Created new stats for user: {}", userId);
        }
    }
    
    /**
     * Kafka consumer method that listens for user occas stats messages
     * and updates user statistics about organized events accordingly.
     * 
     * @param message JSON message containing user occas statistics
     */
    @KafkaListener(topics = OCCA_STATS_TOPIC)
    @Transactional    public void consumeUserOccaStats(String message) {
        log.info("Received user occa stats message: {}", message);
        
        try {
            // Parse the message
            @SuppressWarnings("unchecked")
            Map<String, Object> statsMap = objectMapper.readValue(message, Map.class);
            
            // Extract user ID
            String userIdStr = (String) statsMap.get("userId");
            if (userIdStr == null) {
                log.error("Received user occa stats without userId");
                return;
            }
            
            UUID userId = UUID.fromString(userIdStr);
            
            // Extract statistics
            Integer userTotalOccas = (Integer) statsMap.get("totalOccas");
            
            if (userTotalOccas == null) {
                log.error("Invalid statistics data received: {}", statsMap);
                return;
            }
            
            // Update user statistics for organized events
            updateUserOccaStats(userId, userTotalOccas);
            
        } catch (JsonProcessingException e) {
            log.error("Error parsing user occa stats message: {}", e.getMessage(), e);
        } catch (Exception e) {
            log.error("Error processing user occa stats: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Updates user statistics for organized events.
     * If user stats don't exist yet, creates a new entry.
     * 
     * @param userId ID of the user
     * @param occasOrganized Total number of events the user has organized
     */
    @Transactional
    public void updateUserOccaStats(UUID userId, int occasOrganized) {
        log.info("Updating user occa stats for user {}: events organized={}", 
                userId, occasOrganized);
        
        // Find user stats or create if not exists
        Optional<UserStat> optionalUserStat = userStatRepository.findByUserId(userId);
        
        if (optionalUserStat.isPresent()) {            // Update existing stats
            UserStat userStat = optionalUserStat.get();
            userStat.setEventsOrganized(occasOrganized);
            userStatRepository.save(userStat);
            log.info("Updated existing occa stats for user: {}", userId);
        } else {
            // Create new stats entry
            EndUser user = endUserRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
            
            UserStat userStat = new UserStat(user);
            userStat.setEventsOrganized(occasOrganized);
            // Initialize other stats with default values
            userStat.setEventsAttended(0);
            userStat.setTotalSpent(BigDecimal.ZERO);            userStat.setTicketsPurchased(0);
            userStatRepository.save(userStat);
            log.info("Created new stats with occa count for user: {}", userId);
        }
    }
}
