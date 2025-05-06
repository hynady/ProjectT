package com.ticket.servermono.occacontext.infrastructure.grpc;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

import com.ticket.servermono.occacontext.entities.Show;
import com.ticket.servermono.occacontext.infrastructure.repositories.ShowRepository;

import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;
import occa.CreatorRequestByUserId;
import occa.OccaCreatorServiceGrpc.OccaCreatorServiceImplBase;
import occa.ShowDataResponseByUserId;
import occa.ShowsResponseByUserId;

@Slf4j
@GrpcService
@RequiredArgsConstructor
public class OccaCreatorService extends OccaCreatorServiceImplBase {

    private final ShowRepository showRepository;

    @Override
    @Transactional
    public void getShowsByCreator(CreatorRequestByUserId request,
            StreamObserver<ShowsResponseByUserId> responseObserver) {
        try {
            String userId = request.getUserId();

            if (userId == null || userId.isEmpty()) {
                responseObserver.onError(
                        Status.INVALID_ARGUMENT
                                .withDescription("User ID cannot be null or empty")
                                .asRuntimeException());
                return;
            }

            List<Show> shows = showRepository.findByCreatedBy(UUID.fromString(userId));

            List<ShowDataResponseByUserId> showDataList = new ArrayList<>();
            for (Show show : shows) {
                ShowDataResponseByUserId showData = ShowDataResponseByUserId.newBuilder()
                        .setId(show.getId().toString())
                        .setTime(show.getTime().toString())
                        .setDate(show.getDate().toString())
                        .setOccaId(show.getOcca().getId().toString())
                        .build();
                showDataList.add(showData);
            }

            ShowsResponseByUserId response = ShowsResponseByUserId.newBuilder()
                    .addAllShows(showDataList)
                    .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (IllegalArgumentException e) {
            log.error("Invalid UUID format for user ID: {}", e.getMessage());
            responseObserver.onError(
                    Status.INVALID_ARGUMENT
                            .withDescription("Invalid UUID format for user ID")
                            .asRuntimeException());
        } catch (Exception e) {
            log.error("Error getting shows by creator: {}", e.getMessage());
            responseObserver.onError(
                    Status.INTERNAL.withDescription("Error getting shows by creator").asRuntimeException());
        }
    }
    
}
