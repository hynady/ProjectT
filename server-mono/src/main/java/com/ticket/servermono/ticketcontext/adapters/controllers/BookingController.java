package com.ticket.servermono.ticketcontext.adapters.controllers;

import java.security.Principal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.lang.Nullable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ticket.servermono.ticketcontext.adapters.dtos.BookingPayload;
import com.ticket.servermono.ticketcontext.adapters.dtos.OccaShowDataResponse;
import com.ticket.servermono.ticketcontext.usecases.ShowServices;
import com.ticket.servermono.ticketcontext.usecases.TicketServices;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/booking")
public class BookingController {

    private final ShowServices showServices;
    private final TicketServices ticketServices;

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

    @PostMapping
    public ResponseEntity<?> bookingTickets(@RequestBody BookingPayload payload, @Nullable Principal principal) {
        // Check if user is authenticated
        if (principal == null) {
            return ResponseEntity.status(401).body("Authentication required for booking");
        }
        
        String userId = principal.getName();
        try {
            ticketServices.bookTicket(payload, UUID.fromString(userId));
            return ResponseEntity.ok("{\"status\": \"success\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
