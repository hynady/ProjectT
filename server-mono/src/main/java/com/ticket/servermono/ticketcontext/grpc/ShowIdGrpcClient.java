package com.ticket.servermono.ticketcontext.grpc;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import io.grpc.StatusRuntimeException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.client.inject.GrpcClient;
import occa.OccaIdRequest;
import occa.ShowIdResponse;
import occa.ShowIdServicesGrpc.ShowIdServicesBlockingStub;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShowIdGrpcClient {

    @GrpcClient("occa-service")
    private ShowIdServicesBlockingStub showIdServiceStub;

    /**
     * Get all show IDs for a specific occa ID
     * 
     * @param occaId The occa ID to get show IDs for
     * @return List of show IDs as UUIDs
     */
    public List<UUID> getShowIdsByOccaId(UUID occaId) {
        try {
            // Build the request
            OccaIdRequest request = OccaIdRequest.newBuilder()
                .setOccaId(occaId.toString())
                .build();
            
            // Make the call
            ShowIdResponse response = showIdServiceStub.getShowIdsByOccaId(request);
            
            // Convert string IDs to UUIDs
            return response.getShowIdsList().stream()
                .map(UUID::fromString)
                .collect(Collectors.toList());
                
        } catch (StatusRuntimeException e) {
            log.error("Error fetching show IDs for occa {}: {}", occaId, e.getMessage());
            return new ArrayList<>();
        }
    }
}
