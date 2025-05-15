package com.ticket.servermono.ticketcontext.grpc;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.client.inject.GrpcClient;
import occa.CreatorRequestByUserId;
import occa.OccaCreatorServiceGrpc;
import occa.ShowsResponseByUserId;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class OccaCreatorGrpcClient {
    
    @GrpcClient("occa-service")
    private OccaCreatorServiceGrpc.OccaCreatorServiceBlockingStub creatorServiceStub;

    public List<UUID> getShowIdsByCreatorId(String userId) {
        try {
            CreatorRequestByUserId request = CreatorRequestByUserId.newBuilder()
                .setUserId(userId)  // This should match the field name in the proto
                .build();

            ShowsResponseByUserId response = creatorServiceStub.getShowsByCreator(request);
            //message ShowDataResponseByUserId {
            // string id = 1;
            // string time = 2;
            // string date = 3;
            // string occa_id = 4;
            return response.getShowsList().stream()
                .map(show -> {
                    return UUID.fromString(show.getId());
                })
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error calling OCCA Creator gRPC service: {}", e.getMessage());
            throw e;
        }
    }
}
