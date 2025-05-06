package com.ticket.servermono.occacontext.infrastructure.clients;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import io.grpc.StatusRuntimeException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.client.inject.GrpcClient;
import ticket.OccaTicketStats;
import ticket.TicketStatsRequest;
import ticket.TicketStatsResponse;
import ticket.TicketStatsServiceGrpc.TicketStatsServiceBlockingStub;

@Service
@RequiredArgsConstructor
@Slf4j
public class TicketStatsGrpcClient {

    @GrpcClient("ticket-service")
    private TicketStatsServiceBlockingStub ticketStatsStub;

    public Map<String, OccaTicketStats> getTicketStatsByOccaIds(List<UUID> occaIds, 
                                                        LocalDateTime startDate, 
                                                        LocalDateTime endDate) {
        if (occaIds.isEmpty()) {
            return Collections.emptyMap();
        }
        
        try {
            // Convert UUIDs to strings
            List<String> occaIdStrings = occaIds.stream()
                .map(UUID::toString)
                .collect(Collectors.toList());
            
            // Format dates to ISO string
            String startDateStr = startDate.format(DateTimeFormatter.ISO_DATE_TIME);
            String endDateStr = endDate.format(DateTimeFormatter.ISO_DATE_TIME);
            
            // Build the request with date range
            TicketStatsRequest request = TicketStatsRequest.newBuilder()
                .addAllOccaIds(occaIdStrings)
                .setStartDate(startDateStr)
                .setEndDate(endDateStr)
                .build();
                
            // Make the call
            TicketStatsResponse response = ticketStatsStub.getTicketStatsByOccaIds(request);
            
            // Convert to map for easy lookup
            return response.getStatsList().stream()
                .collect(Collectors.toMap(
                    OccaTicketStats::getOccaId,
                    stats -> stats
                ));
        } catch (StatusRuntimeException e) {
            log.error("Error fetching ticket stats: {}", e.getMessage());
            return Collections.emptyMap();
        }
    }

    /**
     * Get ticket stats with default date range (last year to now)
     */
    public Map<String, OccaTicketStats> getTicketStatsByOccaIds(List<UUID> occaIds) {
        // Default date range: last year to now
        LocalDateTime startDate = LocalDateTime.now().minusYears(1);
        LocalDateTime endDate = LocalDateTime.now();
        return getTicketStatsByOccaIds(occaIds, startDate, endDate);
    }
}
