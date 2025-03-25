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

import com.ticket.servermono.occacontext.adapters.dtos.RegionDTO;
import com.ticket.servermono.occacontext.adapters.dtos.RegionResponseIdName;
import com.ticket.servermono.occacontext.entities.Region;
import com.ticket.servermono.occacontext.usecases.RegionServices;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/v1/regions")
@RequiredArgsConstructor
public class RegionController {
    private final RegionServices regionServices;

    @GetMapping
    public ResponseEntity<?> getRegions() {
        try {
            List<RegionDTO> regions = regionServices.getAllRegionsWithOccaCount();
            return ResponseEntity.ok(regions);
        } catch(RuntimeException e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping("getOnlyNameRegion")
    public ResponseEntity<?> getOnlyNameRegion() {
        try {
            List<RegionResponseIdName> regions = regionServices.getOnlyNameRegion();
            return ResponseEntity.ok(regions);
        } catch(RuntimeException e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Region> getRegionById(@PathVariable UUID id) {
        return ResponseEntity.ok(regionServices.getRegionById(id));
    }

    @PostMapping
    public ResponseEntity<Region> createRegion(
            @RequestParam String name,
            @RequestParam(required = false) String image) {
        return ResponseEntity.ok(regionServices.createRegion(name, image));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Region> updateRegion(
            @PathVariable UUID id,
            @RequestParam String name,
            @RequestParam(required = false) String image) {
        return ResponseEntity.ok(regionServices.updateRegion(id, name, image));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRegion(@PathVariable UUID id) {
        regionServices.deleteRegion(id);
        return ResponseEntity.noContent().build();
    }
}