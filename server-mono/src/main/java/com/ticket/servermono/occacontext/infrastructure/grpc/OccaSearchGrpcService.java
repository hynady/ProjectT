package com.ticket.servermono.occacontext.infrastructure.grpc;

import com.ticket.servermono.occacontext.usecases.OccaServices;
import net.devh.boot.grpc.server.service.GrpcService;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import occa.Empty;
import occa.OccaCardResponse;
import occa.OccaSearchResponse;
import occa.OccaSearchResult;
import occa.OccaSearchServiceGrpc;
import occa.SearchOccasRequest;
import occa.SearchOccasResponse;
import occa.SearchRequest;

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

    @Override
    public void searchOccasForSearchBar(SearchRequest request, StreamObserver<OccaSearchResponse> responseObserver) {
        try {
            var searchResults = occaServices.searchOccasForSearchBar(request.getQuery());
            
            var response = OccaSearchResponse.newBuilder()
                .addAllResults(searchResults.stream()
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
            log.error("Error searching occas with query: {}", request.getQuery(), e);
            responseObserver.onError(e);
        }
    }

    @Override
    public void searchOccas(SearchOccasRequest request, StreamObserver<SearchOccasResponse> responseObserver) {
        try {
            var searchResult = occaServices.searchOccas(
                request.getPage(),
                request.getSize(),
                request.getKeyword(),
                request.getCategoryId(),
                request.getVenueId(),
                request.getSortBy(),
                request.getSortOrder()
            );
            
            var response = SearchOccasResponse.newBuilder()
                .addAllOccas(searchResult.getOccas().stream()
                    .map(occa -> OccaCardResponse.newBuilder()
                        .setId(occa.getId().toString())
                        .setTitle(occa.getTitle())
                        .setImage(occa.getImage())
                        .setDate(occa.getDate())
                        .setTime(occa.getTime())
                        .setLocation(occa.getLocation())
                        .setPrice(occa.getPrice())
                        .setCategoryId(occa.getCategoryId() != null ? occa.getCategoryId().toString() : "")
                        .setVenueId(occa.getVenueId() != null ? occa.getVenueId().toString() : "")
                        .build())
                    .collect(Collectors.toList()))
                .setTotalPages(searchResult.getTotalPages())
                .setTotalElements(searchResult.getTotalElements())
                .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("Error searching occas", e);
            responseObserver.onError(e);
        }
    }
}