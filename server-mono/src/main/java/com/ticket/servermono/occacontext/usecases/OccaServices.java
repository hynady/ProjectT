package com.ticket.servermono.occacontext.usecases;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ticket.servermono.occacontext.adapters.dtos.OccaResponse;
import com.ticket.servermono.occacontext.adapters.dtos.SearchBarTemplateResponse;
import com.ticket.servermono.occacontext.adapters.dtos.SearchOccasResult;
import com.ticket.servermono.occacontext.infrastructure.repositories.OccaRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OccaServices {

    private final OccaRepository occaRepository;

    public List<OccaResponse> getHeroOccaResponses(String userId) {
        return Optional.ofNullable(userId)
                .filter(id -> !id.isEmpty())
                .map(id -> {
                    // Handle case when userId is present
                    // TODO: Add logic to fetch hero occa optimized for user
                    return List.<OccaResponse>of();
                })
                .orElseGet(() -> occaRepository.findFirst6HeroOccas(PageRequest.of(0, 6)));
    }

    @Transactional(readOnly = true)
    public List<OccaResponse> getFeaturedOccaResponses() {
        return occaRepository.findFirst6HeroOccas(PageRequest.of(0, 6));
    }

    @Transactional(readOnly = true)
    public List<OccaResponse> getUpcomingOccaResponses() {
        // Assuming we want to get the latest 6 occasions
        return occaRepository.findFirst6UpcomingOccas(PageRequest.of(0, 6));
    }

    @Transactional(readOnly = true)
    public List<OccaResponse> getTrendingOccaResponses() {
        // Assuming we want to get the latest 3 occasions
        return occaRepository.findFirst3TrendingOccas(PageRequest.of(0, 3));
    }

    @Transactional(readOnly = true)
    public List<OccaResponse> getRecommendedOccaResponses() {
        // Assuming we want to get the latest 3 occasions
        return occaRepository.findFirst3RecommendedOccas(PageRequest.of(0, 3));
    }

    @Transactional(readOnly = true)
    public List<SearchBarTemplateResponse> searchOccasForSearchBar(String query) {
        if (query == null || query.trim().isEmpty()) {
            return List.of();
        }
        return occaRepository.searchOccasForSearchBar(query.toLowerCase(), PageRequest.of(0, 6));
    }

    // @Transactional(readOnly = true)
    // public SearchOccasResult searchOccas(
    // int page,
    // int size,
    // String keyword,
    // String categoryId,
    // String venueId,
    // String sortBy,
    // String sortOrder
    // ) {
    // UUID categoryUuid = categoryId != null && !categoryId.isEmpty() ?
    // UUID.fromString(categoryId) : null;
    // UUID venueUuid = venueId != null && !venueId.isEmpty() ?
    // UUID.fromString(venueId) : null;
    // String searchKeyword = keyword != null && !keyword.isEmpty() ?
    // keyword.toLowerCase() : null;

    // PageRequest pageable = PageRequest.of(page, size);

    // List<OccaResponse> occas = occaRepository.searchOccas(
    // searchKeyword,
    // categoryUuid,
    // venueUuid,
    // sortBy,
    // sortOrder,
    // pageable
    // );

    // long totalElements = occaRepository.countSearchResults(
    // searchKeyword,
    // categoryUuid,
    // venueUuid
    // );

    // return new SearchOccasResult(
    // occas,
    // (int) Math.ceil((double) totalElements / size),
    // totalElements
    // );
    // }

    private UUID parseUuid(String id) {
        if (id == null || id.trim().isEmpty()) {
            return null;
        }
        return UUID.fromString(id);
    }

    // TODO: Tối ưu lại cái này khi điều chỉnh kiểu dữ liệu của ngày và giá
    @Transactional(readOnly = true)
    public SearchOccasResult searchOccas(
            int page,
            int size, 
            String keyword, 
            String categoryId, 
            String venueId, 
            String sortBy, 
            String sortOrder) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortOrder), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        var resultPage = occaRepository.searchOccas(keyword, parseUuid(categoryId), parseUuid(venueId), pageable);

        // Print out the resultPage
        System.out.println(resultPage.getContent());

        return SearchOccasResult.builder()
                .occas(resultPage.getContent())
                .totalPages(resultPage.getTotalPages())
                .totalElements(resultPage.getTotalElements())
                .build();
    }
}
