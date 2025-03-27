package com.ticket.servermono.occacontext.adapters.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ticket.servermono.occacontext.adapters.dtos.CategoryResponse;
import com.ticket.servermono.occacontext.adapters.dtos.OccaResponse;
import com.ticket.servermono.occacontext.usecases.OccaServices;
import com.ticket.servermono.occacontext.usecases.CategoryServices;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/occas")
public class OccaController {

    private final OccaServices occaServices;
    private final CategoryServices categoryServices;

    // Get hero occasions for home page
    @GetMapping("/hero-occas")
    public ResponseEntity<?> getHeroOccas(@RequestParam(required = false) String userId) {
        try {
            List<OccaResponse> heroOccas = occaServices.getHeroOccaResponses(userId);
            return ResponseEntity.ok(heroOccas);
        } catch(RuntimeException e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping("/featured-occas")
    public ResponseEntity<?> getFeaturedOccas() {
        try {
            List<OccaResponse> featuredOccas = occaServices.getFeaturedOccaResponses();
            return ResponseEntity.ok(featuredOccas);
        } catch(RuntimeException e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
    
    @GetMapping("/upcoming-occas")
    public ResponseEntity<?> getUpcomingOccas() {
        try {
            List<OccaResponse> upcomingOccas = occaServices.getUpcomingOccaResponses();
            return ResponseEntity.ok(upcomingOccas);
        } catch(RuntimeException e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping("/categories")
    public ResponseEntity<?> getCategories() {
        try {
            List<CategoryResponse> categories = categoryServices.getAllCategoriesWithCount();
            return ResponseEntity.ok(categories);
        } catch(RuntimeException e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}
