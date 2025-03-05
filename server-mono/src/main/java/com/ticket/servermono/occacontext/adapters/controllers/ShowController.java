package com.ticket.servermono.occacontext.adapters.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ticket.servermono.occacontext.adapters.dtos.Show.OccaShowDataResponse;
import com.ticket.servermono.occacontext.usecases.ShowServices;

import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/shows")
public class ShowController {
    
    private final ShowServices showServices;

    @GetMapping("/{occaId}")
    public ResponseEntity<?> getShowsData(@PathVariable String occaId) {
        try {
            List<OccaShowDataResponse> shows = showServices.getShowsByOccaId(UUID.fromString(occaId));
            return ResponseEntity.ok(shows);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}