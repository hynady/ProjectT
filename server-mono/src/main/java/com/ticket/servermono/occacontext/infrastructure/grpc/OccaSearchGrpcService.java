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
import occa.UserIdRequest;

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
                        .setDate(dto.getDate().toString())
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
    }    @Override
    public void getRecommendedOccas(UserIdRequest request, StreamObserver<OccaSearchResponse> responseObserver) {
        try {
            // Lấy userId từ request, có thể null hoặc rỗng nếu là người dùng ẩn danh
            String userId = request.getUserId().isEmpty() ? null : request.getUserId();
            var recommendedOccas = occaServices.getRecommendedOccaResponses(userId);
            
            var response = OccaSearchResponse.newBuilder()
                .addAllResults(recommendedOccas.stream()
                    .map(dto -> OccaSearchResult.newBuilder()
                        .setId(dto.getId().toString())
                        .setTitle(dto.getTitle())
                        .setDate(dto.getDate().toString())
                        .setLocation(dto.getLocation())
                        .build())
                    .collect(Collectors.toList()))
                .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("Error getting recommended occas for userId: {}", request.getUserId(), e);
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
                        .setDate(dto.getDate().toString())
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
            log.info("Searching occas with request: {}", request);
            var searchResult = occaServices.searchOccas(
                request.getPage(),
                request.getSize(),
                request.getKeyword(),
                request.getCategoryId(),
                request.getVenueId(),
                request.getRegionId(),
                request.getSortBy(),
                request.getSortOrder()
            );
            
            var response = SearchOccasResponse.newBuilder()
                .addAllOccas(searchResult.getOccas().stream()
                    .map(occa -> OccaCardResponse.newBuilder()
                        .setId(occa.getId().toString())
                        .setTitle(occa.getTitle())
                        .setImage(occa.getImage())
                        .setDate(occa.getDate().toString())
                        .setTime(occa.getTime().toString())
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