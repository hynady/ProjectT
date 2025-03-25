package com.ticket.servermono.occacontext.adapters.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ticket.servermono.occacontext.adapters.dtos.VenueResponse;
import com.ticket.servermono.occacontext.entities.Venue;
import com.ticket.servermono.occacontext.usecases.VenueServices;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/v1/venues")
@RequiredArgsConstructor
public class VenueController {
    private final VenueServices venueService;

    @GetMapping
    public ResponseEntity<List<VenueResponse>> getAllVenues() {
        return ResponseEntity.ok(venueService.getAllVenuesWithCount());
    }

    @GetMapping("/by-region/{regionId}")
    public ResponseEntity<List<VenueResponse>> getVenuesByRegion(@PathVariable UUID regionId) {
        return ResponseEntity.ok(venueService.getVenuesByRegionWithCount(regionId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Venue> getVenueById(@PathVariable UUID id) {
        return ResponseEntity.ok(venueService.getVenueById(id));
    }

    @PostMapping
    public ResponseEntity<Venue> createVenue(
            @RequestParam String location,
            @RequestParam String address,
            @RequestParam UUID regionId) {
        return ResponseEntity.ok(venueService.createVenue(location, address, regionId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Venue> updateVenue(
            @PathVariable UUID id,
            @RequestParam String location,
            @RequestParam String address,
            @RequestParam UUID regionId) {
        return ResponseEntity.ok(venueService.updateVenue(id, location, address, regionId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVenue(@PathVariable UUID id) {
        venueService.deleteVenue(id);
        return ResponseEntity.noContent().build();
    }
}