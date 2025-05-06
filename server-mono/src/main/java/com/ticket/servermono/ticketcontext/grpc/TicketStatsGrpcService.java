package com.ticket.servermono.ticketcontext.grpc;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.ticket.servermono.ticketcontext.infrastructure.repositories.TicketRepository;

import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;
import ticket.OccaTicketStats;
import ticket.TicketStatsRequest;
import ticket.TicketStatsResponse;
import ticket.TicketStatsServiceGrpc.TicketStatsServiceImplBase;

@GrpcService
@Service
@RequiredArgsConstructor
@Slf4j
public class TicketStatsGrpcService extends TicketStatsServiceImplBase {

    private final TicketRepository ticketRepository;
    private final ShowIdGrpcClient showIdGrpcClient;

    @Override
    public void getTicketStatsByOccaIds(TicketStatsRequest request, 
            StreamObserver<TicketStatsResponse> responseObserver) {
        try {
            List<String> occaIds = request.getOccaIdsList();
            log.info("Received request for ticket stats for {} occas", occaIds.size());
            
            // Parse date parameters
            LocalDateTime startDate = LocalDateTime.now().minusYears(1); // Default: 1 year ago
            LocalDateTime endDate = LocalDateTime.now(); // Default: now
            
            try {
                if (request.getStartDate() != null && !request.getStartDate().isEmpty()) {
                    startDate = LocalDateTime.parse(request.getStartDate(), DateTimeFormatter.ISO_DATE_TIME);
                }
                if (request.getEndDate() != null && !request.getEndDate().isEmpty()) {
                    endDate = LocalDateTime.parse(request.getEndDate(), DateTimeFormatter.ISO_DATE_TIME);
                }
                log.info("Using date range: {} to {}", startDate, endDate);
            } catch (DateTimeParseException e) {
                log.warn("Invalid date format, using default date range. Error: {}", e.getMessage());
            }
            
            TicketStatsResponse.Builder responseBuilder = TicketStatsResponse.newBuilder();
            
            // For each occaId, calculate the revenue and fill rate
            for (String occaIdStr : occaIds) {
                try {
                    UUID occaId = UUID.fromString(occaIdStr);
                    
                    // Get show IDs for this occa using the gRPC client
                    List<UUID> showIds = showIdGrpcClient.getShowIdsByOccaId(occaId);
                    
                    if (showIds.isEmpty()) {
                        log.warn("No shows found for occa ID: {}", occaId);
                        // Include a zero-stats entry
                        OccaTicketStats stats = OccaTicketStats.newBuilder()
                            .setOccaId(occaIdStr)
                            .setRevenue(0)
                            .setFillRate(0)
                            .build();
                        responseBuilder.addStats(stats);
                        continue;
                    }
                    
                    // Calculate revenue with date range
                    Long revenue = ticketRepository.calculateRevenueByShowIds(showIds, startDate, endDate);
                    revenue = revenue != null ? revenue : 0L;
                    
                    // Calculate fill rate with date range
                    Integer fillRate = ticketRepository.calculateFillRateByShowIds(showIds, startDate, endDate);
                    fillRate = fillRate != null ? fillRate : 0;
                    
                    // Build the stats object
                    OccaTicketStats stats = OccaTicketStats.newBuilder()
                        .setOccaId(occaIdStr)
                        .setRevenue(revenue)
                        .setFillRate(fillRate)
                        .build();
                    
                    responseBuilder.addStats(stats);
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid UUID format: {}", occaIdStr);
                }
            }
            
            TicketStatsResponse response = responseBuilder.build();
            responseObserver.onNext(response);
            responseObserver.onCompleted();
            
            log.info("Successfully sent ticket stats for {} occas", response.getStatsCount());
        } catch (Exception e) {
            log.error("Error processing ticket stats request", e);
            responseObserver.onError(e);
        }
    }
}
