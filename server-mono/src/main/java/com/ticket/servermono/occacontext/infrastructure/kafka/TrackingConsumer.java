package com.ticket.servermono.occacontext.infrastructure.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticket.servermono.occacontext.entities.OccaTrackingStats;
import com.ticket.servermono.occacontext.entities.PersonalTrackingStats;
import com.ticket.servermono.occacontext.infrastructure.repositories.OccaTrackingStatsRepository;
import com.ticket.servermono.occacontext.infrastructure.repositories.PersonalTrackingStatsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class TrackingConsumer {

    private final OccaTrackingStatsRepository occaTrackingStatsRepository;
    private final PersonalTrackingStatsRepository personalTrackingStatsRepository;
    private final ObjectMapper objectMapper;
    
    @KafkaListener(topics = "user-tracking-topic")
    @Transactional
    public void consume(String message) {
        try {
            Map<String, Object> trackingData = objectMapper.readValue(message, new TypeReference<Map<String, Object>>() {});
            
            // Process top occas (for both anonymous and authenticated users)
            if (trackingData.containsKey("topOccas")) {
                List<Map<String, Object>> topOccas = objectMapper.convertValue(
                    trackingData.get("topOccas"), 
                    new TypeReference<List<Map<String, Object>>>() {}
                );
                processTopOccas(topOccas);
            }
            
            // Process user-specific tracking if userId is present
            if (trackingData.containsKey("userId")) {
                String userIdStr = (String) trackingData.get("userId");
                UUID userId = UUID.fromString(userIdStr);
                
                // Process top categories
                if (trackingData.containsKey("topCategories")) {
                    List<Map<String, Object>> topCategories = objectMapper.convertValue(
                        trackingData.get("topCategories"), 
                        new TypeReference<List<Map<String, Object>>>() {}
                    );
                    processUserCategories(userId, topCategories);
                }
                
                // Process top locations
                if (trackingData.containsKey("topLocations")) {
                    List<Map<String, Object>> topLocations = objectMapper.convertValue(
                        trackingData.get("topLocations"), 
                        new TypeReference<List<Map<String, Object>>>() {}
                    );
                    processUserLocations(userId, topLocations);
                }
                
                // Process user-specific occas
                if (trackingData.containsKey("topOccas")) {
                    List<Map<String, Object>> topOccas = objectMapper.convertValue(
                        trackingData.get("topOccas"), 
                        new TypeReference<List<Map<String, Object>>>() {}
                    );
                    processUserOccas(userId, topOccas);
                }
            }
            
        } catch (JsonProcessingException e) {
            log.error("Error processing tracking message: {}", e.getMessage());
        }
    }
    
    private void processTopOccas(List<Map<String, Object>> occaTracks) {
        for (Map<String, Object> occaTrack : occaTracks) {
            UUID occaId = UUID.fromString((String) occaTrack.get("occaId"));
            @SuppressWarnings("unchecked")
            Map<String, Integer> sources = (Map<String, Integer>) occaTrack.get("sources");
            int totalCount = (Integer) occaTrack.get("totalCount");
            
            Optional<OccaTrackingStats> existingStats = occaTrackingStatsRepository.findById(occaId);
            
            OccaTrackingStats stats;
            if (existingStats.isPresent()) {
                stats = existingStats.get();
                
                // Update existing sources counts
                Map<String, Integer> existingSources = stats.getSources();
                for (Map.Entry<String, Integer> source : sources.entrySet()) {
                    existingSources.put(
                        source.getKey(),
                        existingSources.getOrDefault(source.getKey(), 0) + source.getValue()
                    );
                }
                
                stats.setTotalCount(stats.getTotalCount() + totalCount);
            } else {
                stats = new OccaTrackingStats();
                stats.setOccaId(occaId);
                stats.setSources(sources);
                stats.setTotalCount(totalCount);
            }
            
            occaTrackingStatsRepository.save(stats);
            log.debug("Updated OccaTrackingStats for occaId: {}", occaId);
        }
    }
    
    private void processUserCategories(UUID userId, List<Map<String, Object>> categoryTracks) {
        for (Map<String, Object> categoryTrack : categoryTracks) {
            UUID categoryId = UUID.fromString((String) categoryTrack.get("categoryId"));
            int count = (Integer) categoryTrack.get("count");
            
            updatePersonalTrackingStats(
                userId,
                PersonalTrackingStats.TrackingType.CATEGORY,
                categoryId,
                count
            );
        }
    }
    
    private void processUserLocations(UUID userId, List<Map<String, Object>> locationTracks) {
        for (Map<String, Object> locationTrack : locationTracks) {
            UUID locationId = UUID.fromString((String) locationTrack.get("locationId"));
            int count = (Integer) locationTrack.get("count");
            
            updatePersonalTrackingStats(
                userId,
                PersonalTrackingStats.TrackingType.LOCATION,
                locationId,
                count
            );
        }
    }
    
    private void processUserOccas(UUID userId, List<Map<String, Object>> occaTracks) {
        for (Map<String, Object> occaTrack : occaTracks) {
            UUID occaId = UUID.fromString((String) occaTrack.get("occaId"));
            int totalCount = (Integer) occaTrack.get("totalCount");
            
            updatePersonalTrackingStats(
                userId,
                PersonalTrackingStats.TrackingType.OCCA,
                occaId,
                totalCount
            );
        }
    }
    
    private void updatePersonalTrackingStats(UUID userId, PersonalTrackingStats.TrackingType type, UUID typeId, int countToAdd) {
        Optional<PersonalTrackingStats> existingStats = personalTrackingStatsRepository
            .findByUserIdAndTypeAndTypeId(userId, type, typeId);
        
        if (existingStats.isPresent()) {
            PersonalTrackingStats stats = existingStats.get();
            stats.setCount(stats.getCount() + countToAdd);
            personalTrackingStatsRepository.save(stats);
        } else {
            PersonalTrackingStats stats = new PersonalTrackingStats();
            stats.setUserId(userId);
            stats.setType(type);
            stats.setTypeId(typeId);
            stats.setCount(countToAdd);
            personalTrackingStatsRepository.save(stats);
        }
        log.debug("Updated PersonalTrackingStats for userId: {}, type: {}, typeId: {}", userId, type, typeId);
    }
}
