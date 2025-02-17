package com.ticket.servermono.occacontext.adapters.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ticket.servermono.occacontext.adapters.dtos.DetailData.GalleryData;
import com.ticket.servermono.occacontext.usecases.OccaServices;
import com.ticket.servermono.occacontext.usecases.VenueServices;

import lombok.RequiredArgsConstructor;


@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/detail")
public class OccaDetailController {
    
    private final OccaServices occaServices;
    private final VenueServices venueServices;

    @GetMapping("/hero/{occaId}")
    public ResponseEntity<?> getHeroDetail(@PathVariable String occaId) {
        try {
            return ResponseEntity.ok(occaServices.getHeroDetail(occaId));
        } catch(RuntimeException e) {
            if(e.getMessage().equals("Hero not found")) {
                return ResponseEntity.status(404).body(e.getMessage());
            } else {
                return ResponseEntity.status(500).body(e.getMessage());
            }
        }
    }

    @GetMapping("/overview/{occaId}")
    public ResponseEntity<?> getOverviewDetail(@PathVariable String occaId) {
        try {
            return ResponseEntity.ok(occaServices.getOverviewDetail(occaId));
        } catch(RuntimeException e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping("location/{occaId}")
    public ResponseEntity<?> getLocationDetail(@PathVariable String occaId) {
        try {
            return ResponseEntity.ok(venueServices.getLocationDetail(occaId));
        } catch(RuntimeException e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping("gallery/{occaId}")
    public ResponseEntity<?> getGalleryDetail(@PathVariable String occaId) {
    try {
        return ResponseEntity.ok(occaServices.getGalleryDetail(occaId));
    } catch(RuntimeException e) {
        return ResponseEntity.status(500).body(e.getMessage());
    }
}

}
