package com.ticket.servermono.ticketcontext.adapters.controllers;

import java.security.Principal;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.lang.Nullable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ticket.servermono.ticketcontext.adapters.dtos.BookingPayload;
import com.ticket.servermono.ticketcontext.usecases.TicketServices;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/booking")
public class BookingController {

    private final TicketServices ticketServices;

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
