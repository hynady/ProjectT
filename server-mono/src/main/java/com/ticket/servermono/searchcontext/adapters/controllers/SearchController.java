package com.ticket.servermono.searchcontext.adapters.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;

import com.ticket.servermono.searchcontext.adapters.dtos.SearchBarTemplateResponse;
import com.ticket.servermono.searchcontext.usecases.SearchService;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/search")
public class SearchController {
    
    private final SearchService searchService;

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
