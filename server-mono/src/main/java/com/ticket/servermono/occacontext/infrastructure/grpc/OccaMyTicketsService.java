package com.ticket.servermono.occacontext.infrastructure.grpc;

import com.ticket.servermono.occacontext.entities.Occa;
import com.ticket.servermono.occacontext.usecases.OccaServices;

import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;
import occa.OccaMyTicketsResponse;
import occa.OccaMyTicketsServiceGrpc;
import occa.Payload;

import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

@Slf4j
@GrpcService
@RequiredArgsConstructor
public class OccaMyTicketsService extends OccaMyTicketsServiceGrpc.OccaMyTicketsServiceImplBase {

    private final OccaServices occaService;

    @Override
    @Transactional
    public void getOccaInfoForMyTicket(Payload request, StreamObserver<OccaMyTicketsResponse> responseObserver) {
        try {
            log.info("Received gRPC request for occa details with ID: {}", request.getOccaId());
            
            // Parse UUID from request
            UUID occaId = UUID.fromString(request.getOccaId());
            
            // Get occa information from service
            Occa occa = occaService.getOccaById(occaId);

            // Build location string
            String location = occa.getVenue().getLocation() + ", " + occa.getVenue().getAddress();
            
            // Build the response
            OccaMyTicketsResponse response = OccaMyTicketsResponse.newBuilder()
                .setTitle(occa.getTitle())
                .setLocation(location)
                .build();
            
            // Send response
            responseObserver.onNext(response);
            responseObserver.onCompleted();
            
            log.info("Successfully sent occa details for ID: {}", occaId);
        } catch (Exception e) {
            log.error("Error processing gRPC request for occa details: {}", e.getMessage(), e);
            responseObserver.onError(e);
        }
    }
}