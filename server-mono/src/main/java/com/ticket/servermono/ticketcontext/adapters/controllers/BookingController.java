package com.ticket.servermono.ticketcontext.adapters.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ticket.servermono.ticketcontext.adapters.dtos.OccaShowDataResponse;
import com.ticket.servermono.ticketcontext.usecases.ShowServices;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/booking")
public class BookingController {

    private final ShowServices showServices;

    // Get ShowInfo for booking
    @GetMapping("getshow/{occaId}")
    public ResponseEntity<?> getShowInfoForBooking(@PathVariable String occaId) {

         try {
            List<OccaShowDataResponse> shows = showServices.getShowsByOccaId(UUID.fromString(occaId));
            return ResponseEntity.ok(shows);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }

    }
    
}
