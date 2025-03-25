package com.ticket.servermono.searchcontext.adapters.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;

import com.ticket.servermono.searchcontext.adapters.dtos.SearchBarTemplateResponse;
import com.ticket.servermono.searchcontext.adapters.dtos.SearchPageResponse;
import com.ticket.servermono.searchcontext.usecases.SearchService;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/search")
public class SearchController {
    
    private final SearchService searchService;

    @GetMapping
    public List<SearchBarTemplateResponse> searchOccas(@RequestParam String query) {
        return searchService.searchOccasByQuery(query);
    }

    @GetMapping("/occas")
    public ResponseEntity<SearchPageResponse> searchOccas(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(required = false) String keyword,
        @RequestParam(required = false) String categoryId,
        @RequestParam(required = false) String regionId,
        @RequestParam(required = false) String venueId,
        @RequestParam(required = false, defaultValue = "date") String sortBy,
        @RequestParam(required = false, defaultValue = "asc") String sortOrder
    ) {
        try {
            SearchPageResponse response = searchService.searchOccas(page, size, keyword, categoryId, regionId, venueId, sortBy, sortOrder);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }
    
    @GetMapping("trending")
    public ResponseEntity<?> getTrendingOccaForSearchBar() {
        try{
            List<SearchBarTemplateResponse> trendingOccas = searchService.getTrendingOccaForSearchBar();
            return ResponseEntity.ok(trendingOccas);
        } catch (RuntimeException e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping("recommended")
    public ResponseEntity<?> getRecommended() {
        try {
            List<SearchBarTemplateResponse> recommendedOccas = searchService.getRecommendedOccas();
            return ResponseEntity.ok(recommendedOccas);
        } catch (RuntimeException e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}
