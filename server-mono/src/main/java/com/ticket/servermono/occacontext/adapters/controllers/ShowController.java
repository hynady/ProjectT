package com.ticket.servermono.occacontext.adapters.controllers;

import java.security.Principal;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ticket.servermono.common.utils.SecurityUtils;
import com.ticket.servermono.occacontext.adapters.dtos.Show.AddShowPayload;
import com.ticket.servermono.occacontext.adapters.dtos.Show.OccaShowDataResponse;
import com.ticket.servermono.occacontext.adapters.dtos.Show.OrganizeShowResponse;
import com.ticket.servermono.occacontext.adapters.dtos.Show.ShowResponse;
import com.ticket.servermono.occacontext.usecases.ShowServices;

import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1")
public class ShowController {
    
    private final ShowServices showServices;

    @GetMapping("/shows/{occaId}")
    public ResponseEntity<?> getShowsData(@PathVariable String occaId) {
        try {
            List<OccaShowDataResponse> shows = showServices.getShowsByOccaId(UUID.fromString(occaId));
            return ResponseEntity.ok(shows);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/shows/organize/{occaId}")
    public ResponseEntity<?> getOrganizeShowsData(@PathVariable String occaId) {
        try {
            List<OrganizeShowResponse> shows = showServices.getOrganizeShowsByOccaId(UUID.fromString(occaId));
            return ResponseEntity.ok(shows);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
      /**
     * Add a new show to an occasion (exact path match for client implementation)
     */
    @PostMapping("/shows/occas/{occaId}/shows")
    public ResponseEntity<ShowResponse> addShow(@PathVariable String occaId, @RequestBody AddShowPayload showData, Principal principal) {
        try {
            UUID userId = SecurityUtils.getCurrentUserId();
            ShowResponse createdShow = showServices.addShow(UUID.fromString(occaId), showData, userId);
            return ResponseEntity.ok(createdShow);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }    /**
     * Update an existing show for an occasion
     * Endpoint: PUT /organize/occas/{occaId}/shows/{showId}
     */
    @PutMapping("/organize/occas/{occaId}/shows/{showId}")
    public ResponseEntity<ShowResponse> updateShow(
            @PathVariable String occaId, 
            @PathVariable String showId, 
            @RequestBody AddShowPayload showData,
            Principal principal) {
        try {
            UUID userId = SecurityUtils.getCurrentUserId();
            ShowResponse updatedShow = showServices.updateShow(
                UUID.fromString(occaId), 
                UUID.fromString(showId), 
                showData,
                userId
            );
            return ResponseEntity.ok(updatedShow);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Delete a show for an occasion
     * Endpoint: DELETE /organize/occas/{occaId}/shows/{showId}
     */
    @DeleteMapping("/organize/occas/{occaId}/shows/{showId}")
    public ResponseEntity<Void> deleteShow(
            @PathVariable String occaId, 
            @PathVariable String showId) {
        try {
            showServices.deleteShow(
                UUID.fromString(occaId), 
                UUID.fromString(showId)
            );
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}