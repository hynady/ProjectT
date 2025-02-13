package com.ticket.servermono.occacontext.infrastructure.grpc;

import com.ticket.servermono.occacontext.usecases.OccaServices;
import net.devh.boot.grpc.server.service.GrpcService;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import occa.Empty;
import occa.OccaSearchResponse;
import occa.OccaSearchResult;
import occa.OccaSearchServiceGrpc;

import java.util.stream.Collectors;

@Slf4j
@GrpcService
@RequiredArgsConstructor
public class OccaSearchGrpcService extends OccaSearchServiceGrpc.OccaSearchServiceImplBase {
    
    private final OccaServices occaServices;

    @Override
    public void getTrendingOccas(Empty request, StreamObserver<OccaSearchResponse> responseObserver) {
        try {
            var trendingOccas = occaServices.getTrendingOccaResponses();
            
            var response = OccaSearchResponse.newBuilder()
                .addAllResults(trendingOccas.stream()
                    .map(dto -> OccaSearchResult.newBuilder()
                        .setId(dto.getId().toString())
                        .setTitle(dto.getTitle())
                        .setDate(dto.getDate())
                        .setLocation(dto.getLocation())
                        .build())
                    .collect(Collectors.toList()))
                .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("Error getting trending occas", e);
            responseObserver.onError(e);
        }
    }

    @Override
    public void getRecommendedOccas(Empty request, StreamObserver<OccaSearchResponse> responseObserver) {
        try {
            var recommendedOccas = occaServices.getRecommendedOccaResponses();
            
            var response = OccaSearchResponse.newBuilder()
                .addAllResults(recommendedOccas.stream()
                    .map(dto -> OccaSearchResult.newBuilder()
                        .setId(dto.getId().toString())
                        .setTitle(dto.getTitle())
                        .setDate(dto.getDate())
                        .setLocation(dto.getLocation())
                        .build())
                    .collect(Collectors.toList()))
                .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("Error getting recommended occas", e);
            responseObserver.onError(e);
        }
    }
}