package com.ticket.servermono.occacontext.infrastructure.grpc;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.ticket.servermono.occacontext.entities.Show;
import com.ticket.servermono.occacontext.infrastructure.repositories.ShowRepository;

import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;
import occa.OccaIdRequest;
import occa.ShowIdResponse;
import occa.ShowIdServicesGrpc.ShowIdServicesImplBase;

@GrpcService
@Service
@RequiredArgsConstructor
@Slf4j
public class ShowIdServicesGrpc extends ShowIdServicesImplBase {

    private final ShowRepository showRepository;

    @Override
    public void getShowIdsByOccaId(OccaIdRequest request, StreamObserver<ShowIdResponse> responseObserver) {
        try {
            String occaIdStr = request.getOccaId();
            log.info("Received request for show IDs for occa ID: {}", occaIdStr);
            
            UUID occaId = UUID.fromString(occaIdStr);
            List<Show> shows = showRepository.findByOccaId(occaId);
            
            List<String> showIds = shows.stream()
                .map(show -> show.getId().toString())
                .collect(Collectors.toList());
            
            ShowIdResponse response = ShowIdResponse.newBuilder()
                .addAllShowIds(showIds)
                .build();
            
            responseObserver.onNext(response);
            responseObserver.onCompleted();
            
            log.info("Successfully sent {} show IDs for occa ID: {}", showIds.size(), occaIdStr);
        } catch (Exception e) {
            log.error("Error processing getShowIdsByOccaId request: {}", e.getMessage(), e);
            responseObserver.onError(e);
        }
    }
}
