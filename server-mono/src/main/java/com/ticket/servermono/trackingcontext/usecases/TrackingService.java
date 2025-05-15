package com.ticket.servermono.trackingcontext.usecases;

import com.ticket.servermono.trackingcontext.adapters.dtos.TrackingRequest;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrackingService {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;
    
    private static final String TRACKING_TOPIC = "user-tracking-topic";
    
    /**
     * Process tracking data for authenticated users
     */
    public void processUserTracking(String userId, TrackingRequest trackingRequest) {
        try {
            Map<String, Object> message = new HashMap<>();
            
            // Add all tracking data
            if (trackingRequest.getTopOccas() != null && !trackingRequest.getTopOccas().isEmpty()) {
                message.put("topOccas", trackingRequest.getTopOccas());
            }
            
            if (trackingRequest.getTopCategories() != null && !trackingRequest.getTopCategories().isEmpty()) {
                message.put("topCategories", trackingRequest.getTopCategories());
            }
            
            if (trackingRequest.getTopLocations() != null && !trackingRequest.getTopLocations().isEmpty()) {
                message.put("topLocations", trackingRequest.getTopLocations());
            }
            
            // Add userId for authenticated users
            message.put("userId", userId);
            
            // Convert the message to JSON
            String jsonMessage = objectMapper.writeValueAsString(message);
            
            // Send message to Kafka
            kafkaTemplate.send(TRACKING_TOPIC, jsonMessage);
            log.info("Sent tracking data for user: {}", userId);
            
        } catch (Exception e) {
            log.error("Failed to process user tracking data", e);
            throw new RuntimeException("Failed to process tracking data: " + e.getMessage());
        }
    }
    
    /**
     * Process anonymous tracking data (only top occas without user authentication)
     */
    public void processAnonymousTracking(TrackingRequest trackingRequest) {
        try {
            Map<String, Object> message = new HashMap<>();
            
            // Only include top occas for anonymous users
            if (trackingRequest.getTopOccas() != null && !trackingRequest.getTopOccas().isEmpty()) {
                message.put("topOccas", trackingRequest.getTopOccas());
                
                // Convert the message to JSON
                String jsonMessage = objectMapper.writeValueAsString(message);
                
                // Send message to Kafka
                kafkaTemplate.send(TRACKING_TOPIC, jsonMessage);
                log.info("Sent anonymous tracking data");
            }
            
        } catch (Exception e) {
            log.error("Failed to process anonymous tracking data", e);
            throw new RuntimeException("Failed to process tracking data: " + e.getMessage());
        }
    }
}
