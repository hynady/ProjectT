package com.ticket.servermono.ticketcontext.adapters.controllers;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.lang.Nullable;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ticket.servermono.ticketcontext.adapters.dtos.ListTicketsResponse;
import com.ticket.servermono.ticketcontext.usecases.TicketServices;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/tickets")
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
    
}
