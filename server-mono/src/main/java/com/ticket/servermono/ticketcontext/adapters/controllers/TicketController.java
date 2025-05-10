package com.ticket.servermono.ticketcontext.adapters.controllers;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.lang.Nullable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ticket.servermono.ticketcontext.adapters.dtos.ListTicketsResponse;
import com.ticket.servermono.ticketcontext.adapters.dtos.TicketCheckInRequest;
import com.ticket.servermono.ticketcontext.adapters.dtos.TicketCheckInResponse;
import com.ticket.servermono.ticketcontext.usecases.TicketServices;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/tickets")
@Slf4j
public class TicketController {

    private final TicketServices ticketServices;

    @GetMapping("active")
    public ResponseEntity<?> getActiveTicketsData(@Nullable Principal principal) {
        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(401).body("Authentication required for getting tickets");
        }
        try {
            List<ListTicketsResponse> tickets = ticketServices.getActiveTicketsData(UUID.fromString(principal.getName()));
            return ResponseEntity.ok(tickets);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("used")
    public ResponseEntity<?> getUsedTicketsData(@Nullable Principal principal) {
        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(401).body("Authentication required for getting tickets");
        }
        try {
            List<ListTicketsResponse> tickets = ticketServices.getUsedTicketsData(UUID.fromString(principal.getName()));
            return ResponseEntity.ok(tickets);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    /**
     * Check in a ticket using show auth code and ticket code
     * This endpoint is used by organizers to validate and check in tickets at the venue
     * @param request The ticket check-in request containing show auth code and ticket code
     * @return Response indicating success or failure with details
     */
    @PostMapping("/ticket-check-in")
    public ResponseEntity<?> checkInTicket(@RequestBody TicketCheckInRequest request) {
        try {
            TicketCheckInResponse response = ticketServices.checkInTicket(
                    request.getShowAuthCode(), 
                    request.getTicketCode()
            );
            
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            log.error("Error checking in ticket: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("An unexpected error occurred: " + e.getMessage());
        }
    }
}