package com.ticket.servermono.searchcontext.usecases;


import com.ticket.servermono.searchcontext.adapters.dtos.OccaResponse;
import com.ticket.servermono.searchcontext.adapters.dtos.SearchBarTemplateResponse;
import com.ticket.servermono.searchcontext.adapters.dtos.SearchPageResponse;

import io.grpc.StatusRuntimeException;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.client.inject.GrpcClient;
import occa.Empty;
import occa.OccaCardResponse;
import occa.OccaSearchResponse;
import occa.OccaSearchServiceGrpc;
import occa.SearchOccasRequest;
import occa.SearchRequest;
import occa.UserIdRequest;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
public class SearchService {

    @GrpcClient("occa-service")
    private OccaSearchServiceGrpc.OccaSearchServiceBlockingStub occaStub;

    public List<SearchBarTemplateResponse> getTrendingOccaForSearchBar() {
        try {
            OccaSearchResponse response = occaStub.getTrendingOccas(Empty.getDefaultInstance());
            return mapToSearchBarResponses(response);
        } catch (StatusRuntimeException e) {
            log.error("Error calling gRPC service: getTrendingOccas", e);
            throw new RuntimeException("Failed to get trending occasions", e);
        }
    }    public List<SearchBarTemplateResponse> getRecommendedOccas(String userId) {
        try {
            UserIdRequest request = UserIdRequest.newBuilder()
                .setUserId(userId != null ? userId : "")
                .build();
            OccaSearchResponse response = occaStub.getRecommendedOccas(request);
            return mapToSearchBarResponses(response);
        } catch (StatusRuntimeException e) {
            log.error("Error calling gRPC service: getRecommendedOccas for userId: {}", userId, e);
            throw new RuntimeException("Failed to get recommended occasions", e);
        }
    }

    private List<SearchBarTemplateResponse> mapToSearchBarResponses(OccaSearchResponse response) {
        return response.getResultsList().stream()
            .map(result -> {
                return SearchBarTemplateResponse.builder()
                    .id(UUID.fromString(result.getId()))
                    .title(result.getTitle())
                    .date(result.getDate().isEmpty() ? null : LocalDate.parse(result.getDate()))
                    .location(result.getLocation())
                    .build();
            })
            .collect(Collectors.toList());
    }

    public List<SearchBarTemplateResponse> searchOccasByQuery(String query) {
        var request = SearchRequest.newBuilder()
            .setQuery(query)
            .build();
            
        try {
            var response = occaStub.searchOccasForSearchBar(request);
            return mapToSearchBarResponses(response);
        } catch (Exception e) {
            log.error("Error searching occas with query: {}", query, e);
            return List.of();
        }
    }

    public SearchPageResponse searchOccas(
        int page, 
        int size, 
        String keyword, 
        String categoryId, 
        String regionId, 
        String venueId,
        String sortBy,
        String sortOrder
    ) {
        var request = SearchOccasRequest.newBuilder()
            .setPage(page)
            .setSize(size)
            .setKeyword(keyword != null ? keyword : "")
            .setCategoryId(categoryId != null ? categoryId : "")
            .setVenueId(venueId != null ? venueId : "")
            .setRegionId(regionId != null ? regionId : "")
            .setSortBy(sortBy)
            .setSortOrder(sortOrder)
            .build();

        try {
            var response = occaStub.searchOccas(request);
            return SearchPageResponse.builder()
                .occas(response.getOccasList().stream()
                    .map(this::mapToOccaResponse)
                    .collect(Collectors.toList()))
                .totalPages(response.getTotalPages())
                .totalElements(response.getTotalElements())
                .build();
        } catch (Exception e) {
            log.error("Error searching occas", e);
            throw new RuntimeException("Failed to search occasions", e);
        }
    }

    private OccaResponse mapToOccaResponse(OccaCardResponse occa) {
        return OccaResponse.builder()
            .id(UUID.fromString(occa.getId()))
            .title(occa.getTitle())
            .image(occa.getImage())
            .date(occa.getDate().isEmpty() ? null : LocalDate.parse(occa.getDate()))
            .time(occa.getTime().isEmpty() ? null : LocalTime.parse(occa.getTime()))
            .location(occa.getLocation())
            .price(occa.getPrice())
            .categoryId(occa.getCategoryId().isEmpty() ? null : UUID.fromString(occa.getCategoryId()))
            .venueId(occa.getVenueId().isEmpty() ? null : UUID.fromString(occa.getVenueId()))
            .build();
    }
}