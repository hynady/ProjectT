package com.ticket.servermono.occacontext.infrastructure.grpc;

import java.util.Optional;
import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

import com.ticket.servermono.occacontext.entities.Occa;
import com.ticket.servermono.occacontext.infrastructure.repositories.OccaRepository;

import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;
import occa.OccaDataResponse;
import occa.OccaResquest;
import occa.OccaServicesGrpc.OccaServicesImplBase;

@Slf4j
@GrpcService
@RequiredArgsConstructor
public class OccaServicesGrpc extends OccaServicesImplBase {

    private final OccaRepository occaRepository;

    @Override
    @Transactional
    public void getOccaById(OccaResquest request, StreamObserver<OccaDataResponse> responseObserver) {
        try {
            String occaId = request.getOccaId();
            
            if (occaId == null || occaId.isEmpty()) {
                responseObserver.onError(
                    Status.INVALID_ARGUMENT
                        .withDescription("Occa ID cannot be null or empty")
                        .asRuntimeException());
                return;
            }
            
            Optional<Occa> occaOpt = occaRepository.findById(UUID.fromString(occaId));
            
            if (occaOpt.isEmpty()) {
                responseObserver.onError(
                    Status.NOT_FOUND
                        .withDescription("Occa not found with ID: " + occaId)
                        .asRuntimeException());
                return;
            }
            
            Occa occa = occaOpt.get();
            
            // Xây dựng response với title và location
            OccaDataResponse response = OccaDataResponse.newBuilder()
                .setTitle(occa.getTitle())
                .setLocation(occa.getVenue() != null ? occa.getVenue().getLocation() : "Unknown location")
                .build();
                
            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (IllegalArgumentException e) {
            log.error("Invalid UUID format for occa ID: {}", e.getMessage());
            responseObserver.onError(
                Status.INVALID_ARGUMENT
                    .withDescription("Invalid UUID format for occa ID")
                    .asRuntimeException());
        } catch (Exception e) {
            log.error("Error getting occa by ID: {}", e.getMessage());
            responseObserver.onError(
                Status.INTERNAL
                    .withDescription("Error getting occa by ID")
                    .asRuntimeException());
        }
    }
}