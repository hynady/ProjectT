package com.ticket.servermono.searchcontext.usecases;


import com.ticket.servermono.searchcontext.adapters.dtos.SearchBarTemplateResponse;
import io.grpc.StatusRuntimeException;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.client.inject.GrpcClient;
import occa.Empty;
import occa.OccaSearchResponse;
import occa.OccaSearchServiceGrpc;
import org.springframework.stereotype.Service;

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
    }

    public List<SearchBarTemplateResponse> getRecommendedOccas() {
        try {
            OccaSearchResponse response = occaStub.getRecommendedOccas(Empty.getDefaultInstance());
            return mapToSearchBarResponses(response);
        } catch (StatusRuntimeException e) {
            log.error("Error calling gRPC service: getRecommendedOccas", e);
            throw new RuntimeException("Failed to get recommended occasions", e);
        }
    }

    private List<SearchBarTemplateResponse> mapToSearchBarResponses(OccaSearchResponse response) {
        return response.getResultsList().stream()
            .map(result -> SearchBarTemplateResponse.builder()
                .id(UUID.fromString(result.getId()))
                .title(result.getTitle())
                .date(result.getDate())
                .location(result.getLocation())
                .build())
            .collect(Collectors.toList());
    }
}